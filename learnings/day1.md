Download, Installations and setup 
-----------------------------------

1. Install Python : 3.14.4 (latest stable version)
    Backend code will be completely in Python's framework(FastAPI)
    Download : http://python.org/downloads/
    Installation : Make sure, environment variable/path variable is set while installing, so that python could be accessed from anywhere in the system. (usually comes as "Add to Path")
    Verify if installed : python --version


2. Install NodeJS : (LTS : 24.15.0 (LTS(Long Term support) version : stable, tested more, gets bug fixes and security updates for a long time))
    
    Node.js is a runtime environment that allows JavaScript to run outside the browser.
    We are installing Node.js because Next.js (our frontend framework) runs on Node.js.


    Download : http://nodejs.org/en/download
                Scroll down, and click on the .msi windows installer.
    Installation : 
        1. While installing if you get, "Don't run". 
            Click on "More Info", and click "run anyway".
        2. Leave "automatically install the necessary tools. ..." unchecked. We don't need it now.
    Verify if installed : 
        node -v
        npm -v

        What is npm(Node Package Manager) ? 
        Comes bundled with Node.js.
        Used to install and manage JavaScript libraries and dependencies.

It is similar to pip in Python, but also supports running scripts and managing project configurations.


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

    After installation run to setup username and email: 
        git config --global user.name "Their Name"
        git config --global user.email "their@email.com"

        Now, git is ready to run on local

    But, to communicate with github(to push and pull repositories on their server), an authentication mechanism is required. GitHub provides two authentication methods: 
        First one is easy to setup and use, but have to enter the token whenever prompted.
        Second one is a bit complex to setup, but once is done, its for always.

        can go with anyone, both are okay.

        1. HTTPS + Personal Access Token
            a. Settings -> Developer Settings -> Personal Access Tokens -> Tokens(classic) -> Generate New Token -> Generate new token (classic) for general use
            b. Only check the repo(that's all we need now)
            b. After generating, copy the token.
            c. use the token while cloning(will have to enter the Token when prompted for the password)

        2. Generate SSH key: 
        use Git Bash for convenience, as many SSH-related commands are Unix-style. PowerShell and CMD can also be used, but some commands may require slight adjustments.
            a. Open cmd, paste this and enter: ssh-keygen -t ed25519 -C "your_email@example.com"
            This creates a public and private key, private key stays on the machine and the public key we'll upload to the github.
            Just Press enter for any input. no input needed.

            b. Next command : eval "$(ssh-agent -s)"
            The ssh-agent -s outputs some var.
            and eval(...) applied those var in the current session as environment variables.

            c. Next command : ssh-add ~/.ssh/id_ed25519
            Adds your private key to the ssh-agent so it can be used for authentication.
             
            d. Next command: cat ~/.ssh/id_ed25519.pub
                Copy the full output

            e. Go to github, login into your account
                Settings -> SSH and GPG keys -> New SSH key -> Paste your key, give a title -> Save

4. Install PostgreSQL : 
    PostgreSQL is a relational db which we will use.
    Download : 
        1. https://www.postgresql.org/download/windows/
            click on "Download the installer certified by EDB for all supported Postgres versions"
        2. Download 18.3 windows x86-64

    Installation : 
        PostgresQL Server: Check. The database engine that stores and manages your data.
        pgAdmin : Check. Gives UI to interact with the underlying db.
        StackBuilder : Uncheck this, it's used for installing extra add-ons and advanced extensions, no need.
        Command Line Tools : Check. sometimes used to interact with database from cmd/terminal

        postgreSQL creates a default user which has access to everything inside the database. Set a superuser password for the same user. 
        This superuser (postgres) is an admin account for managing databases and users.
        It is NOT related to application users (like signup/login users in your app).


5. Install VS Code : 
    Download : https://code.visualstudio.com/download
    Installation : 
        1. Check Add to path
        2. Check Open with Code


--------------------------

Cloning the project.

1. Create your folder.
2. 
If HTTPS + PAT authentication mechanism is chosen : git clone https://github.com/mukeshcode/SmartReply.git
If SSH authentication mechanism is chosen : git clone git@github.com:mukeshcode/SmartReply.git


-------------------------

Congratulations! Day One is finished!
 
