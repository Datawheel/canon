/**
 * Sanitizes bucket strings to "< n", "n1 - n2", and "n+"
 */
function bucket(n) {    
  const re = new RegExp(/([\$0-9\,]+)[A-z\-\s\&]*([\$0-9\,]*)/g); 
  let nums = re.exec(n); 
  if (nums) {   
    nums = nums.slice(1)     
      .filter(d => d.length)     
      .map(d => {       
        if (d.includes(",")) {         
          if (d.indexOf(",") === d.length - 4) {           
            d = d
              .replace(/,000$/g, "k")             
              .replace(/([0-9]+)(,999$)/g, n => `${parseInt(n) + 1}k`);         
          }         
          else if (d.indexOf(",") === d.length - 8) {           
            d = d
              .replace(/,000,000$/g, "M")             
              .replace(/([0-9]+)(,999,999$)/g, n => `${parseInt(n) + 1}M`);         
          }       
        }        
        return d;     
      });   
    if (nums.length === 2) return nums.join(" - ");   
    else if (n.toLowerCase().match(/under|less|\</g)) return `< ${nums[0]}`;   
    else if (n.toLowerCase().match(/over|more|\+|\>/g)) return `${nums[0]}+`;   
    else return `${nums[0]}`; 
  } 
  else return "None";
}

module.exports = bucket;
