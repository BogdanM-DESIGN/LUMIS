const response=await fetch('data/site.json');
if(response.ok){
 const {company}=await response.json();
 const fields={name:'Denumire',cui:'CUI',address:'Adresă',email:'E-mail',phone:'Telefon'};
 let count=0;
 for(const [key,label] of Object.entries(fields)){
   if(!company[key])continue;
   const p=document.createElement('p');p.textContent=`${label}: ${company[key]}`;
   document.querySelector('#company-details').append(p);count++;
 }
 if(count===5)document.querySelector('#contact-pending').hidden=true;
}
