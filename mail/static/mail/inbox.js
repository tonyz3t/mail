window.onpopstate = function (event) {
  console.log(event.state.mailbox);
  if (event.state.email_id) {
    load_email(event.state.email_id);
  } else {
    load_mailbox(event.state.mailbox, 1);
  }
};

window.onscroll = () => {
  // Check if we're at the bottom
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {

    // Change color to green
    document.querySelector('body').style.background = 'green';
  } else {

    // Change color to white
    document.querySelector('body').style.background = 'white';
  }
};



// DOM CONTENT LOADED //////////////////////////////////////////////////////
document.addEventListener('DOMContentLoaded', function () {

  // Nav buttons
  inbox = document.querySelector('#inbox');
  sent = document.querySelector('#sent');
  archived = document.querySelector('#archived');
  compose = document.querySelector('#compose');
  icon = document.querySelector('#icon');

  icon.addEventListener('click', () => {
    // set the button classes
    inbox.className = "active active-first";
    sent.className = "";
    archived.className = "";
    compose.className = "";

    //add page to history and load mailbox
    history.pushState({ mailbox: 'inbox' }, "", '');
    // set current mailbox
    localStorage.setItem('currentPage', 'inbox');
    // load the mailbox at the first page
    load_mailbox('inbox', 1);

  })

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => {
    // set the button classes
    inbox.className = "active active-first";
    sent.className = "";
    archived.className = "";
    compose.className = "";

    //make the current mailbox invisible before this mailbox loads
    // document.querySelector('#emails-view').style.animationPlayState = 'running';
    // document.querySelector('#emails-view').style.display = 'none';

    //add page to history and load mailbox
    history.pushState({ mailbox: 'inbox' }, "", '');
    // set current mailbox
    localStorage.setItem('currentPage', 'inbox');
    // load the mailbox at the first page
    load_mailbox('inbox', 1);
  });

  document.querySelector('#sent').addEventListener('click', () => {
    // set the button classes
    inbox.className = "";
    sent.className = "active active-first";
    archived.className = "";
    compose.className = "";

    //add page to history
    history.pushState({ mailbox: 'sent' }, "", '');
    localStorage.setItem('currentPage', 'sent');
    load_mailbox('sent', 1);
  });
  document.querySelector('#archived').addEventListener('click', () => {
    // set the button classes
    inbox.className = "";
    sent.className = "";
    archived.className = "active active-first";
    compose.className = "";

    //add page to history
    history.pushState({ mailbox: 'archive' }, "", '');
    localStorage.setItem('currentPage', 'archive');
    load_mailbox('archive', 1);
  });
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the last logged page
  load_mailbox(localStorage.getItem('currentPage'), 1);

  // listen for the submit button press
  document.querySelector('#compose-form').onsubmit = send_email;
});
//////////////////////////////////////////////////////////////////////////////



// Send the email
function send_email() {
  // gather form data
  console.log('inside send_email');
  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;

  console.log('sending email');

  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: recipients,
      subject: subject,
      body: body
    })
  })
    .then(response => response.json())
    .then(() => {
      // send user back to inbox
      load_mailbox('sent');
    })
    .catch(error => {
      console.log('Error:', error);
    });

  return false;
}

function compose_email() {
  localStorage.setItem('currentPage', 'inbox')

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#single-email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox, pageNum) {
  localStorage.setItem('currentPage', mailbox)

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#single-email-view').style.display = 'none';

  // Show the mailbox name
  emailDiv = document.querySelector('#emails-view');
  emailDiv.innerHTML = "";
  h3 = document.createElement('h3');
  h3.innerHTML = `${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}`;
  h3.className = 'sub-email-headers'

  emailDiv.append(h3);

  fetch(`/emails/${mailbox}/${pageNum}`)
    .then(response => response.json())
    .then(emails => {
      // print results
      console.log(emails);
      // gather results into divs
      emails.forEach(email => {
        let div = document.createElement('div');
        div.innerHTML = `${email.sender}, ${email.subject}, ${email.timestamp}`;
        div.className = 'email-headers border border-dark p-2 email-line rounded mb-1';
        div.addEventListener('click', () => {
          // send to the email page
          history.pushState({ email_id: email.id }, "", '');
          load_email(email.id);
        });
        emailDiv.append(div);
      });
    });

}

// Load single email page
function load_email(email_id) {
  // show our email view and close the others
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';

  email_view = document.querySelector('#single-email-view');
  email_view.style.display = 'block';

  // Get the areas on dom to populate
  email_subject = document.querySelector('#email-subject');
  email_sender = document.querySelector('#email-sender');
  email_body = document.querySelector('#email-body');

  //fetch request to load single email
  fetch(`/emails/${email_id}`, {
    method: 'GET'
  })
    .then(response => response.json())
    .then(email => {
      //print it 
      console.log(email);

      email_sender.innerHTML = email.sender;
      email_subject.innerHTML = email.subject;
      email_body.innerHTML = email.body;

    });

}