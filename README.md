# MagicBoot-Server
*Open Source Deployment System*

### Description
MagicBoot is a Windows/CloneZilla image deployment system writen in nodejs.

You can distribute Clonezilla or Windows (*wim) images over PXE boot.

To complete/customize your installation, post-install tasks can be runned after the deployment completed.


### Before you start
MagicBoot requires MongoDB & nodejs.

MongoDB: https://www.mongodb.com/, the community version should do the job.

NodeJS: https://nodejs.org/, the LTS version is recomended.


### Installation
- Download the repository
- Extract to any location
- run `npm install` in the directory
- to start the server `node index.js`


### Tested on
- Windows 10 
- Ubuntu Server 16.04LTS
- nodejs 10.15.0LTS


### Webinterface
![Session](https://raw.githubusercontent.com/the-code-factory/magicboot-server/master/public/assets/img/session.png "Session")
![Computer](https://raw.githubusercontent.com/the-code-factory/magicboot-server/master/public/assets/img/computer.png "Computer")
![Images](https://raw.githubusercontent.com/the-code-factory/magicboot-server/master/public/assets/img/images.png "Images")
![Groups](https://raw.githubusercontent.com/the-code-factory/magicboot-server/master/public/assets/img/groups.png "groups")
![Tasks](https://raw.githubusercontent.com/the-code-factory/magicboot-server/master/public/assets/img/tasks.png "Tasks")


#### Todo's
- langauges pack
- code optimization
- dashboard
- http cluster (multi core use)
- plugin system (VNC)
- auto updater 


#### Note
Early development, still functioning


#### Special thanks to:
- [infusion](https://github.com/infusion), dhcp (https://github.com/infusion/node-dhcp)
- [jue89](https://github.com/jue89), tftp (https://github.com/jue89/node-tftp-server)

*no logical order (random)*