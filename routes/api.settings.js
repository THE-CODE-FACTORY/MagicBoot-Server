const fs = require("fs");
const path = require("path");
const merge = require("merge");
const express = require("express");
const config = require("../config.json");

module.exports = function(log, app){
	
	// <host>/api/settings
	// shortcut to model & router
	router = express.Router();
    
    
    router.get("/", function(req, res){      
      res.json(config);      
    });
    
    
    router.post("/", function(req, res){
      if(req.body){
        
        // merge changes with current config
        merge(config, req.body);
        
        // write json to file
        fs.writeFile(path.resolve(__dirname, "../config.json"), JSON.stringify(config, null, 2), function(err){          
          if(err){
            
            // feedback
            log.warn(err, "Could not save config.json");
            
            // could not save config
            res.status(500).json({
              error: err.message
            });
          
          }else{
            
            // feedback
            log.info("Settings saved");
            
            // success
            res.json(config);
            
          }          
        });      
        
      }else{
        
        res.status(400).json({
          error: "Invalid body"
        });
        
      }     
    });  
    
    
	
	// export router
	return router;
    
};