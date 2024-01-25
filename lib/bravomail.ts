import axios from 'axios';

export const sendBrevoEmail = async (email:string, subject:string ,  html: string, token?: string,) => {
    const url = "https://api.sendinblue.com/v3/smtp/email";
    const api_key =  process.env.BRAVO_MAIL_API 
    const headers = {
      'accept': 'application/json',
      'api-key': api_key,
      'content-type': 'application/json',
    };

   console.log(headers)
  
    const data = {
      "sender": {
        "name":"mail_sender",
        "email":"kaysnuggets@gmail.com"
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
      console.log(response)
      
    } catch (error) {
      console.error(error);
      
    }
  };