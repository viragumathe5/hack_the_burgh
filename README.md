# hack_the_burgh
Repository for getting cooked.

## OpenEuler: Sysmonitor

**Source code:** https://gitee.com/openeuler/sysmonitor
**Dependency:**
- https://gitee.com/Janisa/huawei_secure_c
- https://gitee.com/openeuler/libboundscheck
- CUnit (https://cunit.sourceforge.net/)

### Building Sysmonitor

#### Installing dependencies

##### SecureC

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
sudo apt-get install libcunit1 libcunit1-doc libcunit1-dev
```

#### Building the Source Code

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

