const API_URL = "http://localhost:3000/person";
let isUpdating = false;
let currentPersonName = "";
let isLeticia = false;

function setUser() {
  const username = document.getElementById("username").value;
  document.getElementById("createdBy").value = username;

  isLeticia = username === "Leticia";
  if (username === "") {
    alert("Por favor, preencha o nome");
    document.getElementById("personList").style.display = "none";
  } else if (isLeticia) {
    document.getElementById("personForm").style.display = "block";
    let deleteButtons = document.querySelectorAll(".person-item button.delete");
    document.getElementById("personForm").style.display = "block";

    deleteButtons.forEach((button) => {
      button.style.display = "block";
      button.style.backgroundColor = "red"; // Muda a cor de fundo para vermelho
      button.style.color = "white"; // Muda a cor do texto para branco
    });
  } else {
    document.getElementById("personForm").style.display = "block"; // Mostra o formulário
    document.getElementById("personList").style.display = "block";

    let deleteButtons = document.querySelectorAll(".person-item button.delete");
    deleteButtons.forEach((button) => {
      button.style.display = "none";
    });
  }

  loadPeople(); // Carrega a lista de pessoas
}

document.getElementById("personForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const salary = document.getElementById("salary").value;
  const approved =
    document.getElementById("approved").value.toLowerCase() === "true";
  const trainee =
    document.getElementById("trainee").value.toLowerCase() === "true";
  const createdBy = document.getElementById("createdBy").value; // Captura o valor do createdBy

  const dataInicio = document.getElementById("dataInicio").value;
  const dataFim = document.getElementById("dataFim").value;

  const person = {
    name,
    salary,
    approved,
    trainee,
    createdBy,
    dataInicio,
    dataFim,
  };

  try {
    let response;

    if (isUpdating) {
      // Atualização
      response = await fetch(`${API_URL}/${currentPersonName}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(person),
      });
      if (response.ok) {
        alert("Person updated successfully");
        currentPersonName = "";
        isUpdating = false; // Reset isUpdating after update
        loadPeople();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } else if (isLeticia) {
      // Criação permitida apenas se o usuário for Leticia
      response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(person),
      });
      if (response.ok) {
        alert("Person created successfully");
        loadPeople();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } else {
      alert("Apenas Leticia pode criar novos registros.");
    }

    // Reset form fields
    document.getElementById("personForm").reset();
  } catch (err) {
    alert("Failed to save person");
  }
});

async function loadPeople() {
  try {
    const response = await fetch(API_URL);
    const people = await response.json();
    const createdBy = document.getElementById("createdBy").value.trim();

    const personList = document.getElementById("personList");
    personList.innerHTML = "";

    people.forEach((person) => {
      const personItem = document.createElement("div");
      personItem.classList.add("person-item");
      personItem.innerHTML = `
        <strong>${person.name}</strong>
        <p>Salary: $${person.salary}</p>
        <p>Approved: ${person.approved}</p>
        <p>Trainee: ${person.trainee}</p>
        <p>Data Início: ${new Date(person.dataInicio).toLocaleDateString()}</p>
        <p>Data Fim: ${new Date(person.dataFim).toLocaleDateString()}</p>
        <button class="edit" onclick="editPerson('${
          person.name
        }')">Edit</button>
        ${
          createdBy === "Leticia"
            ? `<button class="delete" onclick="deletePerson('${person.name}')">Delete</button>`
            : ""
        }
      `;
      personList.appendChild(personItem);
    });
  } catch (err) {
    alert("Failed to load people");
  }
}

async function editPerson(name) {
  isUpdating = true;
  console.log("Attempting to edit person with name:", name); // Adicionado log

  try {
    const response = await fetch(`${API_URL}/${name}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`); // Verifica status da resposta
    }
    const person = await response.json();

    document.getElementById("name").value = person.name || "";
    document.getElementById("salary").value = person.salary || "";
    document.getElementById("approved").value = person.approved || "";
    document.getElementById("trainee").value = person.trainee || "";

    // Verifica se as datas estão definidas antes de converter
    document.getElementById("dataInicio").value = person.dataInicio
      ? new Date(person.dataInicio).toISOString().split("T")[0]
      : "";
    document.getElementById("dataFim").value = person.dataFim
      ? new Date(person.dataFim).toISOString().split("T")[0]
      : "";

    currentPersonName = person.name;
  } catch (err) {
    console.error("Error fetching person data:", err); // Adicionado log de erro
    alert("Failed to load person data");
  }
}

async function deletePerson(name) {
  if (confirm("Are you sure you want to delete this person?")) {
    try {
      const response = await fetch(`${API_URL}/${name}?deletedBy=Leticia`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("Person deleted successfully");
        loadPeople();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (err) {
      alert("Failed to delete person");
    }
  }
}
