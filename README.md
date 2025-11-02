# hack_the_burgh

This repository contains proof of concepts that aim to improve the extensibility
and modularity of openEuler's [sysmonitor daemon](https://docs.openeuler.org/en/docs/25.09/tools/maintenance/sysmonitor/sysmonitor_user_guide.html) by implementing two things:

First, we modified the sysmonitor log format to one that is more commonly consumed by conventional logging consumer and visualiser (i.e. JSON format).

Secondly, we build a prototype [RedHat Cockpit](https://www.redhat.com/en/blog/intro-cockpit) plugin that able to leverage sysmonitor various log streams and alert mechanism to provide user-friendly interface for system monitoring.

Both of these works illustrate the potentials of how the sysmonitor capabilities
can be pushed further through extensions and plugins.

## Background

All instructions and on this documents are tested on the following
environment:
- openEuler 25.09 Server (x86_64)
- openEuler 25.09 Edge Cloud Server (x86_64)

## OpenEuler Sysmonitor

**Source code:** https://gitee.com/openeuler/sysmonitor

**Dependency:**

- CMake build tool: https://cmake.org/
- Huawei SecureC library: https://gitee.com/Janisa/huawei_secure_c
- OpenEuler Bounds Check library: https://gitee.com/openeuler/libboundscheck
- CUnit: https://cunit.sourceforge.net/

### Building Sysmonitor

#### Installing dependencies

Before the sysmonitor can be compiled, all the dependencies must be built and
installed.

##### SecureC

The SecureC library must be compiled from the source code.

```bash
# Clone the source code
git clone https://gitee.com/Janisa/huawei_secure_c.git
cd huawei_secure_c/src

# Build the library
make

# Link the .so file and header files to appropriate directories
cd ../lib
sudo ln -s $(pwd)/libsecurec.so /usr/local/lib/

cd ../include
sudo ln -s $(pwd)/* /usr/include/
```

##### LibBoundsCheck

The Bounds Check library must be compiled from the source code.

```bash
# Clone the source code
git clone https://gitee.com/openeuler/libboundscheck
cd libbounscheck

# Build the library
make

# Link the .so file to the approriate directory
cd ../lib
sudo ln -s $(pwd)/libboundscheck.so /usr/local/lib/
```

##### CUnit

CUnit library is publicly available. Install it using the relevant package manager on your environment.

```bash
sudo dnf install CUnit CUnit-devel
```

#### Building the Source Code

Build the sysmonitor and all the relevant binaries by using CMake

```bash
# Clone this repo and make the build directory
cd sysmonitor/sysmonitor-1.3.2/
mkdir build
cd build

# Run cmake
cmake ../

# Run make
make
```

You will see the `sysmonitor` main binary in `build/src/sysmonitor`.

### Running Sysmonitor

The working method to run this modified version of the sysmonitor is by first
install official version of sysmonitor from openEuler package manager, then
disable the sysmonitor daemon and start the custom binary in normal mode.

This method ensures that all the environment requirement (e.g. configuration
files) are satisfied before the custom binary is launched.

```bash
# Install the distro version of sysmonitor
dnf install sysmonitor

# Reboot to complete sysmonitor setup
reboot

# Disable the official sysmonitor daemon
systemctl stop sysmonitor
systemctl disable sysmonitor

# Run the custom binary in normal mode
./build/src/sysmonitor --normal
```

You should see the sysmonitor log stream showing logs in our custom format.

![Screenshot of sysmonitor custom logs](img/ci_logs.jpeg)


## Cockpit Plugins

### Cockpit

**Source code:** https://github.com/cockpit-project/

#### Installing Cockpit on OpenEuler

**Instructions:** https://forum.openeuler.org/t/topic/7906

```bash
sudo dnf upgrade -y
sudo dnf install cockpit
sudo systemctl enable --now cockpit
sudo firewall-cmd --add-port=9090/tcp --permanent
sudo firewall-cmd --reload
```

#### Installing plugins

Plugins can be either installed as a user at:

`~/.local/share/cockpit`

or as system at:

`/usr/share/cockpit/` or `/usr/local/share/cockpit/`

### Plugins

Two plugins were developed based off the
`https://github.com/cockpit-project/starter-kit` repository.

Plugins were developed with react and with the help of ChatGPT including the
running scripts.

#### Getting the plugins on OpenEuler

OpenEuler was run in a VM. To build the plugins and their dependencies the
`Makefile` of the `starter-kit` repository was used.

1. Checkout the repository on your host machine
2. Upload the scripts onto the VM by running `rsync -avr scripts root@<hostname>:/usr/local/share/cockpit/`
3. Export the following variable: `export RSYNC=root@<hostname>` to point to the
   root user of your guest machine
4. `cd` into each plugin folder and run `make watch` to build and deploy the
   plugin to the VM


### Testing the plugins

By using ChatGPT we quickly created two test scripts that test the alarm
functionality of the plugins. The first script available in
`tests/make_zombies.c` can be compiled with a C compiler and run as
`tests/make_zombies 2000` to launch 2000 zombie processes. Similarly, the
`tests/memory.c` script will create 40 dummy processes each using 50 MB of
memory in order to simulate a load on the system.

Furthremore, we configured the system monitor by setting appropriate values in the following files:

- `/etc/sysmonitor/zombie`: Change alarm, resume and poll frequency values
- `/etc/sysmonitor/memory`: Change alarm, resume and poll frequency values
- `/etc/sysconfig/sysmonitor`: Enable zombie process monitoring

Following images shows the visualisation of the dashboard for the memory and zombie process.


* Following image shows the developed visualisation of the logs plugin.

![Screenshot of logs plugin](img/log_board.png)

* Image shows the alarm board for the different logs.

![Screenshot of alarms plugin](img/alarm_board.png)

