#include <unistd.h>
#include <fcntl.h>
#include <stdlib.h>
#include <string.h>
#include <stdio.h>
#include <sys/types.h>
#include <sys/user.h>
#include <sys/ptrace.h>
#include <sys/time.h>
#include <sys/resource.h>
#include <sys/wait.h> 

#include<iostream>

using namespace std;

#define AC 0
#define RE 1
#define TLE 2
#define MLE 3

struct result{
    int status;
    int timeUsed;
    int memoryUsed;
};

/*
set the process limit(cpu and memory)
*/
void setProcessLimit(int timelimit, int memory_limit) {
    struct rlimit rl;
    /* set the time_limit (second)*/
    rl.rlim_cur = timelimit / 1000;
    rl.rlim_max = rl.rlim_cur + 1;
    setrlimit(RLIMIT_CPU, &rl);

    /* set the memory_limit (b)*/
    rl.rlim_cur = memory_limit * 1024;
    rl.rlim_max = rl.rlim_cur + 1024;
    setrlimit(RLIMIT_DATA, &rl);
}

/*
 run the user process
*/
void runCmd(char *args[],long timeLimit, long memoryLimit, char *in, char *out) {
    int newstdin = open(in, O_RDWR|O_CREAT,0644);
    int newstdout = open(out, O_RDWR|O_CREAT|O_TRUNC,0644);
    setProcessLimit(timeLimit, memoryLimit);
    if (newstdout != -1 && newstdin != -1){
        dup2(newstdout, fileno(stdout));
        dup2(newstdin, fileno(stdin));
        if (execvp(args[0], args) == -1) {
            printf("====== Failed to start the process! =====\n");
        }
        close(newstdin);
        close(newstdout);
    } else {
        printf("====== Failed to open file! =====\n");
    }
}

/*
monitor the user process
*/
void monitor(pid_t pid, int timeLimit, int memoryLimit, struct result *rest) {
    int status;
    struct rusage ru;
    if (wait4(pid, &status, 0, &ru) == -1)
        printf("wait4 failure");
    rest->timeUsed = ru.ru_utime.tv_sec * 1000
            + ru.ru_utime.tv_usec / 1000
            + ru.ru_stime.tv_sec * 1000
            + ru.ru_stime.tv_usec / 1000;
    rest->memoryUsed = ru.ru_maxrss;
    if (WIFSIGNALED(status)) {
        switch (WTERMSIG(status)) {
            case SIGSEGV:
                if (rest->memoryUsed > memoryLimit)
                    rest->status = MLE;
                else
                    rest->status = RE;
                break;
            case SIGALRM:
            case SIGXCPU:
                rest->status = TLE;
                break;
            default:
                rest->status = RE;
                break;
        }
    } else {
        if (rest->timeUsed > timeLimit)
            rest->status = TLE;
        else if (rest->memoryUsed > memoryLimit)
            rest->status = MLE;
        else
            rest->status = AC;
    }
}


int run(char *args[], int timeLimit, int memoryLimit, char *in, char *out){
    pid_t pid = vfork();
    if(pid<0)
        printf("error in fork!\n");
    else if(pid == 0) {
        runCmd(args, timeLimit, memoryLimit, in, out);
    } else {
        struct result rest;
        monitor(pid, timeLimit, memoryLimit, &rest);
        printf("{\"status\":\"%d\",\"timeUsed\":\"%d\",\"memoryUsed\":\"%d\"}\n", rest.status, rest.timeUsed, rest.memoryUsed);
    }
}

int main(int argc, char *argv[]){
    char *cmd[20] = {NULL};
    cmd[0] = argv[1];
    run(cmd, atoi(argv[2]), atoi(argv[3]), argv[4], argv[5]);
    return 0;
}
