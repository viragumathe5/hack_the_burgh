#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <sys/types.h>
#include <sys/wait.h>

#define ALLOC_SIZE (1024 * 1024 * 50)  // 50 MB per child process (adjust as needed)

void allocate_memory() {
    // Allocating a large chunk of memory
    void *ptr = malloc(ALLOC_SIZE);
    if (ptr == NULL) {
        perror("Memory allocation failed");
        exit(1);
    }
    // Fill the memory with some data to prevent optimization out
    for (size_t i = 0; i < ALLOC_SIZE / sizeof(int); ++i) {
        ((int *)ptr)[i] = i;
    }

    // The memory will not be freed in this process
    // This process will keep running to maintain memory usage
    while (1) {
        sleep(1);
    }
}

int main() {
    int num_processes = 0;
    pid_t pid;
    
    while (num_processes<40) {
        // Create a new process to allocate memory
        pid = fork();
        if (pid == 0) {
            // Child process
            allocate_memory();
            exit(0);  // Terminate after memory is allocated
        } else if (pid > 0) {
            // Parent process
            num_processes++;
            printf("Forked process %d, total processes: %d\n", pid, num_processes);
        } else {
            // Fork failed
            perror("Fork failed");
            exit(1);
        }

        // Optionally, you can add a sleep time to control the rate of forking
	sleep(0.1);
    }

    // Wait for child processes to finish (although they'll run indefinitely)
    while (wait(NULL) > 0);
    return 0;
}
