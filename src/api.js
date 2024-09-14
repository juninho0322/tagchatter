document.addEventListener("DOMContentLoaded", () => {
  const messageInput = document.getElementById("message-input");
  const sendButton = document.getElementById("send-button");
  const messagesContainer = document.getElementById("messages-container");

  // Function to handle parrot icon click
  const handleParrotClick = (messageDiv, parrotImg) => {
    const hasParrot = parrotImg.classList.contains("active");

    // Toggle the background color and parrot icon
    if (hasParrot) {
      // Change to inactive state
      messageDiv.classList.remove("bg-slate-400");
      messageDiv.classList.add("bg-slate-300");
      parrotImg.src = "src/img/parrot.gif"; // URL of inactive parrot image
      parrotImg.classList.remove("active");
      updateParrotCounter(-1); // Decrease counter
    } else {
      // Change to active state
      messageDiv.classList.remove("bg-slate-300");
      messageDiv.classList.add("bg-slate-400");
      parrotImg.src = "src/img/light-parrot.svg"; // URL of active parrot image
      parrotImg.classList.add("active");
      updateParrotCounter(1); // Increase counter
    }
  };

  // Function to update the parrot counter
  const updateParrotCounter = (increment) => {
    const counterElement = document.getElementById("parrots-counter");
    const currentCount = parseInt(counterElement.textContent, 10) || 0;
    counterElement.textContent = currentCount + increment;
  };

  // Function to create and add a message to the DOM
  const createMessageElement = (message) => {
    const messageDiv = document.createElement("div");
    messageDiv.className = "message mb-6 flex-row ";

    const messageDivHeader = document.createElement("div");
    messageDivHeader.className = "messages-container-header flex gap-4 ";

    const messageBody = document.createElement("div");
    messageBody.className = "ml-12 text-sm ";

    const avatarImg = document.createElement("img");
    avatarImg.src =
      message.author && message.author.avatar
        ? message.author.avatar
        : "https://via.placeholder.com/100"; // Fallback image URL
    avatarImg.className = "w-8 h-8";

    const authorName = document.createElement("h3");
    authorName.textContent =
      message.author && message.author.name
        ? message.author.name
        : "Unknown Author";

    const messageContent = document.createElement("p");
    messageContent.textContent = message.content;
    messageContent.className = "m-auto";

    const messageTimestamp = document.createElement("span");
    const date = new Date(message.created_at);
    messageTimestamp.textContent = `${date.toLocaleString()}`;

    const parrotImg = document.createElement("img");
    parrotImg.src = "src/img/parrot.gif";
    parrotImg.className = "w-6 h-6";

    // Append elements
    messageDivHeader.appendChild(avatarImg);
    messageDivHeader.appendChild(authorName);
    messageDivHeader.appendChild(messageTimestamp);
    messageDivHeader.appendChild(parrotImg);
    messageBody.appendChild(messageContent);
    messageDiv.appendChild(messageDivHeader);
    messageDiv.appendChild(messageBody);

    messagesContainer.appendChild(messageDiv);

    // Attach click handler to parrot image
    parrotImg.addEventListener("click", () =>
      handleParrotClick(messageDiv, parrotImg)
    );
  };

  // Fetch and display messages from the API
  const fetchAndUpdateMessages = () => {
    fetch("https://tagchatter.herokuapp.com/messages?stable=true")
      .then((response) => response.json())
      .then((data) => {
        messagesContainer.innerHTML = "";
        data.forEach((message) => createMessageElement(message));
      })
      .catch((error) => console.error("Error fetching messages:", error));
  };

  // Get current user info
  const getCurrentUser = async () => {
    try {
      const response = await fetch("https://tagchatter.herokuapp.com/me");
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }
      const user = await response.json();
      return user;
    } catch (error) {
      console.error("Error fetching current user:", error);
      return null;
    }
  };

  // Post a new message
  const postMessage = async () => {
    const messageContent = messageInput.value.trim();
    const currentUser = await getCurrentUser();

    if (messageContent !== "") {
      const messageData = {
        message: messageContent,
        created_at: new Date().toISOString(),
        has_parrot: false,
        author_id: currentUser.id,
      };

      try {
        const response = await fetch(
          "https://tagchatter.herokuapp.com/messages",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },

            body: JSON.stringify(messageData),
          }
        );

        if (!response.ok) {
          const error = await response.json();
          console.error(error);
          throw new Error(
            `Server responded with ${response.status}: ${error.message}`
          );
        }

        const data = await response.json();
        console.log("Message posted successfully:", data);

        // Clear the input field
        messageInput.value = "";

        // Optionally, immediately add the posted message to the container
        createMessageElement(messageData);
      } catch (error) {
        console.error("Error posting message:", error);
      }
    }
  };

  // Fetch messages on page load and every 3 seconds
  fetchAndUpdateMessages();
  setInterval(fetchAndUpdateMessages, 3000);

  // Add event listener for the send button
  sendButton.addEventListener("click", postMessage);
});
