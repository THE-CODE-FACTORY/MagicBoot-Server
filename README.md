# MagicBoot-Server
*Open Source Deployment System*

### Description
MagicBoot is a Windows/CloneZilla image deployment system writen in nodejs.\
You can distribute Clonezilla or Windows (*wim) images over PXE boot.\
To complete/customize your installation, post-install tasks can be runned after the deployment completed.


### Before you start
MagicBoot requires MongoDB & NodeJS.\
MongoDB: https://www.mongodb.com/, the community version should do the job.\
NodeJS: https://nodejs.org/, LTS version recomended.


### Installation
- Download the repository
- Extract to any location
- run `npm install` in the directory
- create config.json
- to start the server `node index.js`

### Configuration
```json
{
  "services": {
    "autodiscover": {
      "listen": true,
      "interval": 5000,
      "broadcast": "127.0.0.1",
      "host": "172.16.0.1",
      "services": {
        "http": true,
        "tftp": true,
        "dhcp": false
      }
    },
    "updater": {
      "listen": true,
      "interval": 4,
      "lastCheck": 1547997931549
    },
    "proxy": {
      "listen": false
    },
    "http": {
      "listen": true,
      "host": "0.0.0.0",
      "port": 80,
      "cluster": false,
      "worker": 8,
      "ssl": {
        "redirect": false,
        "enabled": false,
        "key": "",
        "cert": "",
        "port": 443
      }
    },
    "tftp": {
      "listen": true,
      "host": "172.16.0.1",
      "port": 69,
      "root": "./tftp-root"
    },
    "dhcp": {
      "listen": true,
      "host": "0.0.0.0",
      "port": 67,
      "options": {
        "range": [
          "172.16.0.100",
          "172.16.0.200"
        ],
        "netmask": "255.255.255.0",
        "router": [
          "172.16.0.254"
        ],
        "dns": [
          "9.9.9.9",
          "1.1.1.1",
          "8.8.8.8"
        ],
        "broadcast": "172.16.0.255",
        "server": "172.16.0.1",
        "leaseTime": 86400
      }
    },
    "state": {
      "listen": false,
      "host": "172.16.0.1",
      "port": 10242
    }
  },
  "logger": {
    "level": "trace",
    "time": "yyyy.mm.dd - HH:MM:ss.l",
    "path": "./log"
  },
  "database": {
    "host": "127.0.0.1",
    "port": 27017,
    "authentication": {
      "enabled": false,
      "username": "",
      "password": ""
    }
  },
  "images": {
    "external": true,
    "location": "\\\\172.16.0.1\\images",
    "type": "cifs",
    "authentication": {
      "enabled": true,
      "domain": "",
      "username": "deployment",
      "password": "Pa$$w0rd"
    },
    "proxy": {
      "enabled": false,
      "host": "192.168.2.110",
      "port": 8445
    }
  },
  "startup": {
    "harmony": false,
    "delay": 2000,
    "restart": false
  },
  "network": {
    "interface": "enp4s0"
  }
}
```
The settings works "out-of-the-box".\
Bad is, that i hard-coded the server ip in the windows pe image.\
So you have to use this ip range, till i add a autodiscover method.

172.16.0.1:     Server\
172.16.0.254:   Gateway


### Image storage
As storage for images, we use a simple NTFS/SMB/SAMBA share.\
Create a shared drive and create a user with read access.\
Don't forget to add your credentials in the `config.json`


### Tested on
- Windows 10 
- Ubuntu Server 16.04LTS
- nodejs 10.15.0LTS


### Webinterface

###### Screenshots
https://github.com/THE-CODE-FACTORY/MagicBoot-Server/wiki/Screenshots

###### Session (Computer in queue)
![Session](https://raw.githubusercontent.com/the-code-factory/magicboot-server/master/public/assets/img/session.png "Session")
![Session](https://raw.githubusercontent.com/the-code-factory/magicboot-server/master/public/assets/img/session-1.png "Session")
![Session](https://raw.githubusercontent.com/the-code-factory/magicboot-server/master/public/assets/img/session-2.png "Session")

###### Computer
![Computer](https://raw.githubusercontent.com/the-code-factory/magicboot-server/master/public/assets/img/computer.png "Computer")

###### Image
![Images](https://raw.githubusercontent.com/the-code-factory/magicboot-server/master/public/assets/img/images.png "Images")

###### Groups
![Groups](https://raw.githubusercontent.com/the-code-factory/magicboot-server/master/public/assets/img/groups.png "groups")

###### Tasks
![Tasks](https://raw.githubusercontent.com/the-code-factory/magicboot-server/master/public/assets/img/tasks.png "Tasks")


#### Todo's
- languages pack
- code optimization
- admin interface
  - dashboard
  - ~~settings~~
    - ~~network~~
    - ~~database~~
    - ~~images~~
  - ~~services~~
    - ~~autodiscover~~
    - ~~dhcp~~
    - ~~tftp~~
    - ~~http~~
  - updates
<<<<<<< HEAD
  - ~~logfiels~~
=======
  - logfile
>>>>>>> 9cae72acf9e4927a6c5fed82047102158026bb6d
  - ~~computer~~
- http cluster (multi core use)
- plugin system (VNC, RDP)
- updater (auto update)
- web based installer
- service wrapper (run on OS startup)
  - Windows
  - Linux
- User management (low priority)
  - Register
  - Rights
  - Tokens
  - API Authentication


#### Note
Early development, still functioning


#### Build with/based on
- AngularJS
- syslinux/pxelinux
- Windows PE
- Clonezilla


#### Special thanks to:
- [infusion](https://github.com/infusion), dhcp (https://github.com/infusion/node-dhcp)
- [gagle](https://github.com/gagle), tftp (https://github.com/gagle/node-tftp)

*no logical order (random)*
