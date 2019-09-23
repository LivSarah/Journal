import $ from "jquery";
import "../styles/index.scss";

const moment = require("moment");

$(document).ready(function() {
	const data = {
		req: document.req,
		res: document.res
	};

	$.ajax({
		url: "/api/v1/start",
		type: "POST",
		data,
		success: function(e) { 
			loadJournalPage();
		},
		error: function(error) {
			console.log("Not currently signed in");
		}
	});
});

function loadJournalPage() {
	document.getElementById("login_page").style.display = "none";
	document.getElementById("journal_page").style.display = "block";

	//Loading all entries from the DB
	$(document).ready(function() {
		$.ajax({
			url: "/api/v1/journalentry",
			type: "GET"
		}).done(data => {
			console.log("Done getting", data);
			renderCards(data);
		});
	});
}

function loadLoginPage() {

	document.getElementById("journal_page").style.display = "none";
	document.getElementById("login_page").style.display = "block";
}
global.loadLoginPage = loadLoginPage;

//Method for logging in if email/pwd is correct
function loginForm() {
	const data = {
		email: $("#email").val(),
		password: $("#pwd").val()
	};

	$.ajax({
		url: "/api/v1/login",
		type: "POST",
		data,
		success: function(e) {
			loadJournalPage();
		},
		error: function(error) {
			alert("Probably wrong email or password. Did you remember to register?");
		}
	});
}
global.loginForm = loginForm;

function signOut() {
	$.ajax({
		url: "/api/v1/signout",
		type: "GET",
		done: function(e) {
			loadLoginPage();
		},
		error: function(error) {
			console.log(`Error for some reason: ${error}`);
		}
	});
}
global.signOut = signOut;

//Method for loading all entries in the journal
function renderCards(cards) {
	//Reset the div with cards
	document.getElementById("journal_cards").innerHTML = `<div id="journal-cards-fake-div"></div>`;

	$.each(cards, (i, card) => {
		var entrycard = createCard(card);
		$("#journal-cards-fake-div").after(entrycard);
	});
}

//Method for publishing new entry
function publishNewEntry() {
	const data = {
		title: $("#new-entry-title").val(),
		subtitle: $("#new-entry-subtitle").val(),
		body: $("#new-entry-body").val(),
		IMG: $("#new-entry-IMG").val()
	};

	if (!data.IMG) {
		data.IMG = "https://www.freeiconspng.com/uploads/no-image-icon-11.PNG";
	}

	$.ajax({
		url: "/api/v1/journalentry",
		type: "POST",
		data
	}).done(data => {
		console.log("Posted data to database", data);
		loadJournalPage();
	});
}
global.publishNewEntry = publishNewEntry; 

function deleteCardById(id) {
	$.ajax({
		url: `/api/v1/journalentry/${id}`,
		type: "DELETE"
	}).done(data => {
		console.log("Deleted data from the database", data);
		loadJournalPage();
	});
}
global.deleteCardById = deleteCardById;

function updateCardById(id) {

	const data = {
		title: $("#updated-entry-title").val(),
		subtitle: $("#updated-entry-subtitle").val(),
		body: $("#updated-entry-body").val(),
		IMG: $("#updated-entry-IMG").val()
	};

	if (!data.IMG) {
		data.IMG = "https://www.freeiconspng.com/uploads/no-image-icon-11.PNG";
	}
	console.log("ID is: " + id);
	console.log("HERE", $("#updated-entry-title"));
	$.ajax({
		url: `/api/v1/journalentry/${id}`,
		type: "PUT",
		data
	}).done(data => {
		console.log("Updated data", data);
		removeModal();
		loadJournalPage();
	}).fail(err => {
		console.log(err);
	});
}

global.updateCardById = updateCardById;

//Method for creating a single journal card
function createCard(card) {
	const updatedAt = moment(card.updatedAt).format("ddd Do MMM YYYY HH:mm");
	const createdAt = moment(card.createdAt).format("ddd Do MMM YYYY HH:mm");

	return `
    <div class="card mb-2">
        <div class="row no-gutters">
            <div class="col-md-4">
                <img id="entry-img" src="${card.IMG}" class="card-img" alt="photo">
            </div>
            <div class="col-md-8">
                <div class="card-body">
                <h5 id="entry-title" class="card-title">${card.title}</h5>
                <h6 id="entry-subtitle" style="font-style: italic">${card.subtitle}</h6>
                <p id="entry-body" class="card-text">${card.body}</p>
                <p class="card-text"><small id="entry-published" class="text-muted"> ${"Published: " +
									createdAt}</small></p>
                <p class="card-text"><small  id="entry-updated" class="text-muted">${"Last updated: " +
									updatedAt}</small></p>
                </div>
            </div>
			<div class="edit-and-update col-md-4">
				<button class="btn" type="button" id="update-button-${card.id}" onclick="updateButtonClicked(${
		card.id
	})">
					<i class="far fa-edit"></i>
				</button>
				<button class="btn" type="button" id="delete-button-${card.id}" onclick="deleteCardById(${
		card.id
	})">
					<i class="far fa-trash-alt"></i>
				</button>
            </div>
        </div>
    </div>
    `;
}

// Method for signing up new user
$("#signup_form").submit(function(e) {
	e.preventDefault();
	signup_modal.style.display = "none";
	const data = {
		email: $("#signup_email").val(),
		password: $("#signup_pwd").val()
	};

	$.ajax({
		url: "/api/v1/signup",
		type: "POST",
		data,
		success: function(e) {
			alert("Sign up successfull");
			loadLoginlPage();
		},
		error: function(error) {
			alert("Something went wrong. Sign up unsuccessfull");
			console.log(`Error for some reason: ${error.val}`);
		}
	});
});

/* JS FOR THE MODALS */
// Get the modal
let signup_modal = document.getElementById("signup_modal");
let update_entry_modal = document.getElementById("update_entry_modal");

// Get the button that opens the modal
let signup_button = document.getElementById("signup_button");
let update_entry_button = document.getElementById("update_entry_button");

// Get the <span> element that closes the modal
let spanSignup = document.getElementsByClassName("closeSignup")[0];
let spanUpdateEntry = document.getElementsByClassName("close_update_entry")[0];

// When the user clicks on the button, open the modal
signup_button.onclick = function() {
	signup_modal.style.display = "block";
};

function updateButtonClicked(id) {
	$.ajax({
		url: `/api/v1/journalentry/${id}`,
		type: "GET"
	}).done(data => {
		document.getElementById("update-entry-modal-content").innerHTML = 
		`
		<span id="close_update_entry" class="close_update_entry close" onclick="removeModal();">&times;</span>
		<form method="" id="update_entry_form" onsubmit="updateCardById(${id}); return false" class="modal_form">
			<h2>UPDATE JOURNAL ENTRY</h2>
			<div class="form-group">
				<label>Journal title:</label> <br />
				<input type="text" class="headline form-control" id="updated-entry-title" name="Title" value="${data.title}"/>
				<br />
			</div>
			<div class="form-group">
				<label>Subtitle:</label> <br />
				<input type="text" class="subtitle form-control" id="updated-entry-subtitle"  value="${data.subtitle}"/> <br />
			</div>
			<div class="form-group">
				<label>Text:</label> <br />
				<textarea type="text" class="entry_body form-control" id="updated-entry-body">${data.body}</textarea>
				<br />
			</div>
			<div class="form-group">
				<label>Image URL:</label> <br />
				<input type="text" class="photo form-control" id="updated-entry-IMG" value="${data.IMG}"/>
			</div>
			<button type="submit" id="update_entry_button" class="btn btn-outline-dark signup-btn">
				Update
			</button>
		</form>
		`;
	});
	update_entry_modal.style.display= "block";
}
global.updateButtonClicked = updateButtonClicked;

// When the user clicks on <span> (x), close the modal
spanSignup.onclick = function() {
	signup_modal.style.display = "none";
};


function removeModal() {
	update_entry_modal.style.display = "none";
}
global.removeModal = removeModal;

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
	if (event.target == signup_modal) {
		signup_modal.style.display = "none";
	}
	if (event.target == update_entry_modal) {
		update_entry_modal.style.display = "none";
	}
};
/* END JS FOR MODALS*/
