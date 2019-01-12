# MagicBoot-Server
*Open Source Deployment System*

### Description
MagicBoot is a Windows/CloneZilla image deployment system writen in nodejs.\
You can distribute Clonezilla or Windows (*wim) images over PXE boot.\
To complete/customize your installation, post-install tasks can be runned after the deployment completed.


### Before you start
MagicBoot requires MongoDB & nodejs.\
MongoDB: https://www.mongodb.com/, the community version should do the job.\
NodeJS: https://nodejs.org/, LTS version is recomended.


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

###### Session (Computer in queue)
![Session](https://raw.githubusercontent.com/the-code-factory/magicboot-server/master/public/assets/img/session.png "Session")
![Session](https://raw.githubusercontent.com/the-code-factory/magicboot-server/master/public/assets/img/session%20-%201.png "Session")
![Session](https://raw.githubusercontent.com/the-code-factory/magicboot-server/master/public/assets/img/session%20-%202.png "Session")
![Session](https://raw.githubusercontent.com/the-code-factory/magicboot-server/master/public/assets/img/session%20-%203.png "Session")

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


#### Note
Early development, still functioning


#### Build with/based on
- AngularJS
- syslinux/pxelinuxa
- Windows PE
- Clonezilla


#### Special thanks to:
- [infusion](https://github.com/infusion), dhcp (https://github.com/infusion/node-dhcp)
- [gagle](https://github.com/gagle), tftp (https://github.com/gagle/node-tftp)

*no logical order (random)*