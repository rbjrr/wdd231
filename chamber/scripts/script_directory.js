document.getElementById("year").textContent = new Date().getFullYear();
document.getElementById("lastModified").textContent = document.lastModified;

document.addEventListener("DOMContentLoaded", () => {
    const membersContainer = document.getElementById("members");
    const toggleButton = document.getElementById("toggleView");
    const hamburgerButton = document.getElementById("mobileMenu");
    const mainNav = document.getElementById("navigation");

    async function fetchMembers() {
        try {
            const response = await fetch("data/members.json");
            const members = await response.json();
            displayMembers(members);
        } catch (error) {
            console.error("Error fetching json members:", error);
        }
    }

    function displayMembers(members) {
        membersContainer.innerHTML = "";
        members.forEach(member => {
            const card = document.createElement("div");
            card.classList.add("member-card");
            card.innerHTML = `
                
                <img src="images/${member.image}" alt="${member.name}">
                <h3>${member.name}</h3>
                <p>${member.address}</p>
                <p>${member.phone}</p>
                <p>${member.email}</p>
                <a href="${member.website}" target="_blank">Visit Website</a>
                
            `;
            membersContainer.appendChild(card);
        });
    }

    toggleButton.addEventListener("click", () => {
        document.body.classList.toggle("list-view");
    });

    hamburgerButton.addEventListener("click", () => {
        mainNav.classList.toggle("active");
        if (mainNav.classList.contains("active")) {
            mobileMenu.innerHTML = "x";
        } else {
            mobileMenu.innerHTML ="≡";
        }
    });

    fetchMembers();
});
    