const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'pages', 'OrmawaAdmin');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx'));

files.forEach(f => {
  const filePath = path.join(dir, f);
  let c = fs.readFileSync(filePath, 'utf8');
  
  if ((c.includes('useState') || c.includes('useEffect')) && 
      !c.includes('useState} from') && 
      !c.includes('useState } from') && 
      !c.includes('useState,') && 
      !c.includes('useState }')) {
    
    const importReact = "import React, { useState, useEffect } from 'react';\n";
    if (c.startsWith('"use client"')) {
      c = c.replace('"use client"', '"use client"\n' + importReact);
    } else {
      c = importReact + c;
    }
    
    fs.writeFileSync(filePath, c);
    console.log('Fixed', f);
  }
});
