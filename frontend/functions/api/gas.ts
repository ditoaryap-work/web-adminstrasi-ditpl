export const onRequestPost = async (context: any) => {
  const GAS_URL = "https://script.google.com/macros/s/AKfycbx9KplRj5m9rqIfMJt9VlcptrmqZ2lD_AVxA3nOidlwXhneFBnoMFNVkxcWO2G80K9r4Q/exec";
  
  try {
    const payload = await context.request.text();
    
    // Request ke GAS
    const response = await fetch(GAS_URL, {
      method: 'POST',
      body: payload,
      headers: {
        'Content-Type': 'text/plain;charset=utf-8', // GAS lebih aman menerima text/plain untuk trigger doPost JSON Stringify
      },
      redirect: 'follow'
    });

    const responseText = await response.text();
    
    return new Response(responseText, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      }
    });

  } catch (error: any) {
    return new Response(JSON.stringify({
      status: false,
      message: "Proxy Error: " + error.message,
    }), { 
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    });
  }
}

export const onRequestOptions = async () => {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });
}
