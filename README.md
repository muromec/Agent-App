### What?
dstucrypt/agent packaged in an app.

### Run
    gulp downloadatomshell
    gulp run

This sequence of commands will try to download atom-shell for your platfrom and run the app.

Then you can just use gulp run.

### Package
    gulp package

This will package an app for darwin-x64, linux-ia32, linux-x64 and win32-ia32.
First run takes a lot of time due to runtimes download. The subsequent runs will use cached runtimes and will take just several seconds.

The packaged apps are inside the release folder.
