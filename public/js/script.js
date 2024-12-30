function toggleNav() {
    const navList = document.getElementById('nav-list');
    const button = document.querySelector('.toggle-button');
    
    // Toggle the nav list visibility
    navList.style.display = (navList.style.display === 'block') ? 'none' : 'block';
    
    // Change the button to an "X" or back to the hamburger menu
    if (button.innerHTML === '☰') {
      button.innerHTML = '×'; // Change to "X"
    } else {
      button.innerHTML = '☰'; // Change back to hamburger
    }


  }