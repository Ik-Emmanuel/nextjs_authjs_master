import axios from 'axios';

export const sendBrevoEmail = async (email:string, subject:string ,  html: string, token?: string,) => {
    const url = "https://api.sendinblue.com/v3/smtp/email";
    const headers = {
      'accept': 'application/json',
      'api-key': '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',
      'content-type': 'application/json',
    };
  
    const data = {
      "sender": {
        "name":"Geona",
        "email":"hello@geona.io"
      },
      "to": [{"email": email}],
      "subject": subject,
      "htmlContent": html,
      "headers": {
        "X-Mailin-custom": "custom_header_1",
        "charset": "iso-8859-1"
      }
    };

    
  
    try {
      const response = await axios.post(url, data, { headers });
      const statusCode = response.status;
      console.log(statusCode)
      
    } catch (error) {
      console.error(error);
      
    }
  };