/* make_zombies.c
 *
 * Create N zombie processes for testing.
 *
 * Usage:   gcc -std=c11 -O2 -Wall -o make_zombies make_zombies.c
 *          ./make_zombies <count>
 *
 * Example: ./make_zombies 300
 *
 * WARNING: creating many zombies can exhaust kernel process table entries.
 * Run only in a disposable VM/container and as an unprivileged user.
 */

#define _POSIX_C_SOURCE 200809L
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <sys/types.h>
#include <sys/resource.h>
#include <errno.h>
#include <string.h>
#include <limits.h>
#include <stdint.h>
#include <time.h>

static void msleep(long ms) {
    struct timespec ts;
    ts.tv_sec = ms / 1000;
    ts.tv_nsec = (ms % 1000) * 1000000L;
    nanosleep(&ts, NULL);
}

int main(int argc, char **argv) {
    if (argc != 2) {
        fprintf(stderr, "Usage: %s <number_of_zombies>\n", argv[0]);
        return 2;
    }

    char *end;
    long requested = strtol(argv[1], &end, 10);
    if (*end != '\0' || requested <= 0) {
        fprintf(stderr, "Invalid number: %s\n", argv[1]);
        return 2;
    }

    if (requested > 100000) {
        fprintf(stderr, "Refusing to create more than 100000 childs (sensible upper bound).\n");
        return 2;
    }

    /* Check current per-user process limit */
    struct rlimit rl;
    if (getrlimit(RLIMIT_NPROC, &rl) == 0) {
        if (rl.rlim_cur != RLIM_INFINITY) {
            /* leave some headroom for system processes and this process itself */
            unsigned long headroom = 50;
            if ((unsigned long)requested > (rl.rlim_cur > headroom ? rl.rlim_cur - headroom : 0)) {
                fprintf(stderr,
                        "Requested %ld children would exceed soft RLIMIT_NPROC (%llu) minus headroom %lu.\n",
                        requested, (unsigned long long)rl.rlim_cur, headroom);
                fprintf(stderr, "Adjust the limit or choose a smaller number, and run in a disposable environment.\n");
                return 3;
            }
        }
    } else {
        /* If we can't get limit, warn but continue */
        fprintf(stderr, "Warning: getrlimit(RLIMIT_NPROC) failed: %s. Proceeding anyway.\n", strerror(errno));
    }

    printf("Parent PID: %d\n", (int)getpid());
    printf("Creating %ld zombie children (ctrl-c to stop parent; killing parent will allow init to reap children)\n", requested);
    fflush(stdout);

    for (long i = 0; i < requested; ++i) {
        pid_t pid = fork();
        if (pid < 0) {
            fprintf(stderr, "fork() failed at iteration %ld: %s\n", i, strerror(errno));
            fprintf(stderr, "Created %ld children so far.\n", i);
            return 4;
        }
        if (pid == 0) {
            /* child exits immediately and becomes a zombie until parent reaps it */
            _exit(0);
        } else {
            /* parent: print child PID so you can inspect it */
            printf("%ld: child PID %d\n", i+1, (int)pid);
            fflush(stdout);
            /* small pause to avoid spiking the system */
            msleep(10); /* 10 ms between forks */
        }
    }

    printf("Done forking. Parent will now sleep indefinitely, keeping children as zombies until parent exits.\n");
    fflush(stdout);

    /* Keep parent alive forever. We purposely do NOT call wait() so children remain zombies.
       Using pause() will return on signals (e.g. SIGCHLD), but since we do not call wait() the
       children will remain zombies until the parent exits. */
    for (;;) {
        pause();
    }

    return 0;
}

