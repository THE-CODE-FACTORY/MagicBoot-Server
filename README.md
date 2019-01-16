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
  "interface": "eth0",
  "services": {
    "autodiscover": {
      "listen": false,
      "interval": 5000,
      "broadcast": "127.0.0.1",
      "host": "172.16.0.1"
    },
    "updater": {
      "listen": true,
      "interval": 4,
      "lastCheck": 1547575891288
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
        "dns": ["9.9.9.9","1.1.1.1","8.8.8.8"],
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
      "username": "asdf4f",
      "password": "34f324fsdfasdf"
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
    "interface": "eth0"
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
- dashboard
- http cluster (multi core use)
- plugin system (VNC)
- auto updater 
- ~~autodiscover (zero conf for client)~~


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