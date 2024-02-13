import React, { useEffect, useRef } from 'react';
import { withLive } from 'react-live';

const IframePreview = ({ live }) => {
  const iframeRef = useRef(null);

  const createHtmlWrapper = (code) => {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>React Iframe</title>
        <script src="https://unpkg.com/react/umd/react.production.min.js"></script>
        <script src="https://unpkg.com/react-dom/umd/react-dom.production.min.js"></script>
        <style>
          /* Add any additional CSS styles here */
        </style>
      </head>
      <body>
        <div id="root"></div>
        <script type="text/javascript">
          document.addEventListener('DOMContentLoaded', () => {
            alert('loaded');s
            window.addEventListener('message', (event) => {
              // Handle incoming messages
              console.log('Message received in iframe:', event.data);
              // Optionally send a response back to the parent
              event.source.postMessage('Response from iframe', event.origin);
            });
  
            // Insert the transpiled React code here
            ${code}
          });
        </script>
      </body>
      </html>
    `;
  };


  useEffect(() => {
    if (iframeRef.current && live.code) {
      const iframeDocument = iframeRef.current.contentDocument;
      iframeDocument.open();
      iframeDocument.write(createHtmlWrapper(live.code));
      iframeDocument.close();
    }

    window.addEventListener('message', (event) => {
      // Ensure the message is from the iframe
      if (event.source === iframeRef.current.contentWindow) {
        console.log('Message received from iframe:', event.data);
      }
    });

    // Send a message to the iframe
    const sendMessageToIframe = () => {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        iframeRef.current.contentWindow.postMessage('Hello from parent', '*');
      }
    };

    // Example: Send message after a delay
    setTimeout(sendMessageToIframe, 3000);

    return () => {
      window.removeEventListener('message', this);
    };
  }, [live.code]);

  return (
    <iframe
      ref={iframeRef}
      style={{ width: '100%', height: '300px' }}
      title="Live Preview"
    />
  );
};

export default withLive(IframePreview);
