const fs = require('fs');

// Update API types
let apiContent = fs.readFileSync('src/lib/api.ts', 'utf8');
apiContent = apiContent.replace('  status: "active" | "inactive";', '');
fs.writeFileSync('src/lib/api.ts', apiContent);
console.log('Updated API types');

// Update business service
let serviceContent = fs.readFileSync('src/lib/services/businessService.ts', 'utf8');
serviceContent = serviceContent.replace('status?: "active" | "inactive";', '');
fs.writeFileSync('src/lib/services/businessService.ts', serviceContent);
console.log('Updated business service');

// Update WhatsApp config form
let formContent = fs.readFileSync('src/components/business/WhatsAppConfigForm.tsx', 'utf8');
formContent = formContent.replace('status: z.enum(["active", "inactive"]).optional(),', '');
formContent = formContent.replace('status?: "active" | "inactive";', '');
fs.writeFileSync('src/components/business/WhatsAppConfigForm.tsx', formContent);
console.log('Updated WhatsApp config form');

console.log('All frontend files updated');
