document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;
        const title = document.createElement("h4");
        title.textContent = name;
        activityCard.appendChild(title);

        const description = document.createElement("p");
        description.textContent = details.description;
        activityCard.appendChild(description);

        const schedule = document.createElement("p");
        const scheduleLabel = document.createElement("strong");
        scheduleLabel.textContent = "Schedule: ";
        schedule.append(scheduleLabel, details.schedule);
        activityCard.appendChild(schedule);

        const availability = document.createElement("p");
        const availabilityLabel = document.createElement("strong");
        availabilityLabel.textContent = "Availability: ";
        availability.append(availabilityLabel, `${spotsLeft} spots left`);
        activityCard.appendChild(availability);

        const participantsSection = document.createElement("div");
        participantsSection.className = "activity-participants";
        const participantsHeading = document.createElement("h5");
        participantsHeading.textContent = "Participants";
        participantsSection.appendChild(participantsHeading);

        const participantsList = document.createElement("ul");
        participantsList.className = "participants-list";
        details.participants.forEach((email) => {
          const participant = document.createElement("li");
          const participantEmail = document.createElement("span");
          participantEmail.textContent = email;
          participant.appendChild(participantEmail);

          const removeButton = document.createElement("button");
          removeButton.type = "button";
          removeButton.className = "remove-participant";
          removeButton.setAttribute("aria-label", `Remove ${email} from ${name}`);
          removeButton.title = `Remove ${email}`;

          const removeIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
          removeIcon.setAttribute("viewBox", "0 0 24 24");
          removeIcon.setAttribute("width", "16");
          removeIcon.setAttribute("height", "16");
          removeIcon.setAttribute("fill", "none");
          removeIcon.setAttribute("stroke", "currentColor");
          removeIcon.setAttribute("stroke-width", "2");
          removeIcon.setAttribute("stroke-linecap", "round");
          removeIcon.setAttribute("stroke-linejoin", "round");
          removeIcon.setAttribute("aria-hidden", "true");
          const removeIconPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
          removeIconPath.setAttribute("d", "M3 6h18M8 6V4h8v2m3 0-1 14H6L5 6m5 4v6m4-6v6");
          removeIcon.appendChild(removeIconPath);
          removeButton.appendChild(removeIcon);

          removeButton.addEventListener("click", async () => {
            removeButton.disabled = true;
            try {
              const response = await fetch(
                `/activities/${encodeURIComponent(name)}/signup?email=${encodeURIComponent(email)}`,
                { method: "DELETE" }
              );
              const result = await response.json();

              if (!response.ok) {
                throw new Error(result.detail || "Could not unregister participant");
              }

              details.participants.splice(details.participants.indexOf(email), 1);
              participant.remove();
              availability.lastChild.textContent =
                `${details.max_participants - details.participants.length} spots left`;

              if (details.participants.length === 0) {
                const emptyMessage = document.createElement("li");
                emptyMessage.className = "no-participants";
                emptyMessage.textContent = "No participants yet";
                participantsList.appendChild(emptyMessage);
              }

              messageDiv.textContent = result.message;
              messageDiv.className = "success";
              messageDiv.classList.remove("hidden");
            } catch (error) {
              messageDiv.textContent = error.message || "Failed to unregister participant";
              messageDiv.className = "error";
              messageDiv.classList.remove("hidden");
              removeButton.disabled = false;
            }
          });

          participant.appendChild(removeButton);
          participantsList.appendChild(participant);
        });
        if (details.participants.length === 0) {
          const emptyMessage = document.createElement("li");
          emptyMessage.className = "no-participants";
          emptyMessage.textContent = "No participants yet";
          participantsList.appendChild(emptyMessage);
        }
        participantsSection.appendChild(participantsList);
        activityCard.appendChild(participantsSection);

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
