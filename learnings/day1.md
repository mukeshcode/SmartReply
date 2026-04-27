Installations
-------------

1. Install Python : 3.14.4 (LTS(Long Term support) version : stable, tested more, gets bug fixes and security updates for a long time)
    Backend code will be completely in Python's framework(FastAPI)
    Download : http://python.org/downloads/
    Installation : Make sure, environment variable/path variable is set while installing, so that python could be accessed from anywhere in the system. (usually comes as "Add to Path")
    Verify if installed : python --version


2. Install NodeJS : (LTS : 24.15.0)
    NodeJS is actually a runtime engine for Javascript. Actually, JS was purposefully built to work on browser, restricting the wonderful capabilities of this simple yet powerful language. 
    NodeJS works as a runtime engine, allowing it to work anywhere on the servers, in the terminal.

    But, here, we are installing it for Next.JS. As it is built on top of NodeJS.

    Download : http://nodejs.org/en/download
                Scroll down, and click on the .msi windows installer.
    Installation : 
        1. While installing if you get, "Don't run". 
            Click on "More Info", and click "run anyway".
        2. Leave "automatically install the necessary tools. ..." unchecked. We don't need it now.
    Verify if installed : 
        node -v
        npm -v

        What is npm ? 
        Node package manager : automatically comes with node, helps in installing/managing libraries/packages. JS equivalent of pip in python, but it has many more additional features too like running scripts, ...


3. Install git : (2.54.0)
    Git is a version control system. Very very popular.
    Nice practice to use git and push regularly for devs.
    Download : https://git-scm.com/install/windows
               this one => Git for Windows/x64 Setup.

    Install : 
        1. Check Add a git bash profile to windows terminal. (This will add an option to enable git bash interface in the command prompt itself. Good option for devs.)
        2. Uncheck Scalar (Git add-on to manage large-scale repositories)

        Everything else is okay.

    Verify command : git --version


4. Install PostgreSQL : 
    PostgreSQL is a relational db which we will use.
    Download : 
        1. https://www.postgresql.org/download/windows/
            click on "Download the installer certified by EDB for all supported Postgres versions"
        2. Download 18.3 windows x86-64

    Installation : 
        PostgresQL Server: Check. Actual db.
        pgAdmin : Check. Gives UI to interact with the underlying db.
        StackBuilder : Uncheck this, it's used for installing extra add-ons and advanced extensions, no need.
        Command Line Tools : Check. sometimes used to interact with database from cmd/terminal

        postgreSQL creates a default user which has access to everything inside the database. Set a superuser password for the same user. 


5. Install VS Code : 
    Download : https://code.visualstudio.com/download
    Installation : 
        1. Check Add to path
        2. Check Open with Code

 
