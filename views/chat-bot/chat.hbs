<!DOCTYPE html>
<html>

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Flexi Chatbot</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
  <style>
    body {
      background: hsl(230 73% 5%);
      font-family: 'Poppins', sans-serif;
    }

    .chat-section {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 2rem;
    }

    .chat-section #chat-container {
      background-color: #fff;
      border-radius: 20px;
      box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
      width: 40vw;
      height: 80vh;
      display: flex;
      flex-direction: column;
    }

    .chat-section h1 {
      text-align: center;
      margin-bottom: 15px;
      color: #333;
      font-weight: 600;
      text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
      font-size: 2.2rem;
      margin-top: 20px;
    }

    .chat-section #chat-history {
      height: calc(100% - 60px);
      overflow-y: scroll;
      padding: 1.5rem;
      padding-top: 1rem;
      font-size: 1rem;
      flex-grow: 1;
    }

    .chat-section .user-message {
      text-align: right;
      padding: 10px 15px;
      background-color: #f7f7f7;
      border-radius: 20px;
      border-bottom-right-radius: 0;
      margin-bottom: 10px;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
    }

    .chat-section .bot-message {
      text-align: left;
      padding: 10px 15px;
      background-color: #e6f9ec;
      border-radius: 20px;
      border-bottom-left-radius: 0;
      margin-bottom: 10px;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
    }

    .chat-section form {
      display: flex;
      margin: 0;
      padding: 1rem;
      background-color: #fff;
      border-top: 1px solid #e6e6e6;
      border-bottom-right-radius: 20px;
      border-bottom-left-radius: 20px;
      box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.1);
    }

    .chat-section input {
      flex-grow: 1;
      margin-right: 10px;
      padding: 10px 15px;
      border: 1px solid #ccc;
      border-radius: 20px;
      font-size: 1rem;
      transition: all 0.3s ease;
    }

    .chat-section input:focus,
    .chat-section input:hover {
      outline: none;
      box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
    }

    .chat-section button {
      background-color: #48c78e;
      color: #fff;
      border: none;
      padding: 10px 20px;
      border-radius: 20px;
      cursor: pointer;
      font-size: 1rem;
      transition: all 0.3s ease;
    }

    .chat-section button:hover {
      background-color: #3ba877;
      color: #fff;
    }

    .chat-section #loader {
      display: none;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }

    @media (max-width: 992px) {
      .chat-section #chat-container {
        width: 50vw;
      }
      .chat-section h1{
        font-size: 1.7rem;
      }
      .chat-section #chat-history{
        font-size: 0.94rem;
      }
      .chat-section .form-control-file,
      .chat-section .btn{
        font-size: 0.94rem !important;
      }
    }
    @media (max-width: 768px) {
      .chat-section #chat-container {
        width: 60vw;
      }
      .chat-section h1{
        font-size: 1.5rem;
      }
      .chat-section #chat-history{
        font-size: 0.89rem;
      }
      .chat-section .form-control-file,
      .chat-section .btn{
        font-size: 0.89rem !important;
      }
    }

    @media (max-width: 576px) {
      .chat-section #chat-container {
        width: 90vw;
      }
      .chat-section h1{
        font-size: 1.26rem;
      }
      .chat-section #chat-history{
        font-size: 0.8rem;
      }
      .chat-section .form-control-file,
      .chat-section .btn{
        font-size: 0.8rem !important;
      }
    }
  </style>
</head>

<body>
  <div class="chat-section">
    <div id="chat-container" class="card">
      <h1>Flexi Chatbot</h1>
      <div id="chat-history">
        <div class="bot-message">Hi, I'm Flexi your fitness assistant. <br>Tell me about your fitness status and
          fitness goals.</div>
      </div>
      <form id="chat-form">
        <input class="form-control-file" type="text" id="user-input" placeholder="Enter your message"
          autocomplete="off">
        <button class="btn" type="submit">Send</button>
      </form>
    </div>
    <div id="loader">
      <img src="loader.gif" width="150px" alt="Loading...">
    </div>
  </div>

  <script>
    const chatHistory = document.getElementById('chat-history');
    const userInput = document.getElementById('user-input');
    const form = document.getElementById('chat-form');

    async function sendMessage() {
      const userMessage = userInput.value;
      userInput.value = ''; // Clear input field
      console.log(userMessage)
      try {
        const response = await fetch('/users/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userInput: userMessage }),
        });

        const data = await response.json();
        console.log(data)
        const botMessage = data.response;
        console.log(botMessage)
        // Add chat message to the chat history
        chatHistory.innerHTML += `<div class="user-message">${userMessage}</div>`;
        chatHistory.innerHTML += `<div class="bot-message">${botMessage}</div>`;

        // Scroll to the bottom of the chat history
        chatHistory.scrollTop = chatHistory.scrollHeight;
      } catch (error) {
        console.error('Error:', error);
        // Handle errors gracefully, e.g., display an error message to the user
      }
    }

    form.addEventListener('submit', (event) => {
      event.preventDefault(); // Prevent form submission
      const loader = document.getElementById('loader');
      loader.style.display = 'block'; // Show the loader
      sendMessage().finally(() => {
        loader.style.display = 'none'; // Hide the loader after the message is sent
      });
    });
  </script>

  <script src="https://code.jquery.com/jquery-3.5.1.slim.min.js"
    integrity="sha384-DfXdz2htPH0lsSSs5nCTpuj/zy4C+OGpamoFVy38MVBnE+IbbVYUew+OrCXaRkfj"
    crossorigin="anonymous"></script>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@4.5.3/dist/js/bootstrap.bundle.min.js"
    integrity="sha384-ho+j7jyWK8fNQe+A12Hb8AhRq26LrZ/JpcUGGOn+Y7RsweNrtN/tE3MoK7ZeZDyx"
    crossorigin="anonymous"></script>
</body>

</html>