// JavaScript Code (index.js)
let jsonData = [];
let selectedFoods = [];
document.addEventListener('DOMContentLoaded', () => {
    loadJSON();
        // Attach form submit event listener
        document.getElementById('add-food').addEventListener('submit', (event) => {
            event.preventDefault(); // Prevent default form submission
            saveDailyCalories();
        });
        document.getElementById('calendar-date').addEventListener('change', onDateSelected);
});

function loadJSON() {
    // Fetch JSON data and populate categories
    fetch('food_nutrition.json') // Assuming your server is running locally
        .then(response => response.json())
        .then(data => {
            // Ensure that data and data.foods are defined
            if (data && Array.isArray(data.foods)) {
                jsonData = data.foods;
                // Log the received JSON data for debugging
                populateCategories();
                populateFoods(); // Populate foods based on the initially selected category
            } else {
                console.error('Invalid JSON format or missing "foods" array.');
            }
        })
        .catch(error => console.error('Error fetching JSON:', error));
}



function populateCategories() {
    const selectElement = document.getElementById('food-category');
    // Clear existing options
    selectElement.innerHTML = '';
    console.log('JSON data:', jsonData); 
    // Extract unique categories from JSON data
    const categories = [...new Set(jsonData.map(item => item.category))];
    console.log(categories);
    // Create and append options to the select box
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        selectElement.appendChild(option);
    });
}

function populateFoods() {
    const selectedCategory = document.getElementById('food-category').value;
    const searchInput = document.getElementById('search-term');

    // Filter foods based on the selected category
    const filteredFoods = jsonData.filter(item => item.category === selectedCategory);

    // Extract unique food names from filtered data
    const foodNames = [...new Set(filteredFoods.map(item => item.name))];

    // Set the input placeholder and reset its value
    searchInput.placeholder = '輸入' + selectedCategory + '名稱';
    searchInput.value = '';

    // Create a datalist and populate it with options
    const dataList = document.getElementById('food-options');
    dataList.innerHTML = '';
    foodNames.forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        dataList.appendChild(option);
    });
}

function saveDailyCalories() {
    const selectedDate = $('#calendar-date').val();
    const selectedFood = $('#search-term').val();
    const foodWeight = $('#food-weight').val();

    // Find the selected food in the jsonData array
    const selectedFoodData = jsonData.find(item => item.name === selectedFood);

    if (selectedDate && selectedFood && foodWeight && selectedFoodData) {
        const modify = foodWeight/100;

        // Create an object to send to the server
        const formData = {
            Date: selectedDate,
            foodname: selectedFood,
            food_protein: selectedFoodData.protein*modify,
            food_carbs: selectedFoodData.carbs*modify,
            food_fats: selectedFoodData.fats*modify,
            food_calories: selectedFoodData.calories*modify,
        };
        // Use $.post to send the form data to the server
        $.post('/students', formData, function (response) {
            if (response) {
                // If the server responds with a success status
                console.log('Food added successfully');
                // Optionally, clear the input fields
                $('#search-term').val('');
                $('#food-weight').val('');
                displayFoodsForSelectedDate(selectedDate)
            } else {
                // If the server responds with an error status
                console.error('Failed to add food');
            }
        })
        .fail(function (error) {
            // Handle Ajax request errors
            console.error('Error sending data to server:', error);
        });
    } else {
        console.error('Invalid input data.');
    }
}

function onDateSelected() {
    const selectedDate = document.getElementById('calendar-date').value;
    displayFoodsForSelectedDate(selectedDate);
}
async function displayFoodsForSelectedDate(selectedDate) {
    try {
        // Fetch all foods from the server
        $.get('/students', function (allfoods) {
            const foodsForSelectedDate = allfoods.filter(food => food.Date === selectedDate);
            const resultsContainer = document.getElementById('search-results');
            resultsContainer.innerHTML = '';

            if (foodsForSelectedDate.length > 0) {
                const header = document.createElement('div');
                header.textContent = `Foods for ${selectedDate}`;
                resultsContainer.appendChild(header);

                const list = document.createElement('ul');
                let totalCalories = 0;
                let totalProtein = 0;
                let totalCarbs = 0;
                let totalFats = 0;
                foodsForSelectedDate.forEach(food => {
                    const listItem = document.createElement('li');
                    listItem.textContent = `${food.foodname} protein ${food.food_protein}g carbs ${food.food_carbs}g fats ${food.food_fats}g - ${food.food_calories} Calories`;
                    list.appendChild(listItem);
                    totalCalories += parseFloat(food.food_calories);
                    totalProtein += parseFloat(food.food_protein);
                    totalFats += parseFloat(food.food_fats);
                    totalCarbs += parseFloat(food.food_carbs)
                });
                const totalContainer = document.createElement('div');
                totalContainer.textContent = `Total Protein: ${totalProtein.toFixed(2)} Total Carbs: ${totalCarbs.toFixed(2)} Total Fats: ${totalFats.toFixed(2)}  Total Calories: ${totalCalories.toFixed(2)}`;
                resultsContainer.appendChild(list);
                resultsContainer.appendChild(totalContainer);
            } else {
                const noDataMessage = document.createElement('div');
                noDataMessage.textContent = 'No foods recorded for the selected date.';
                resultsContainer.appendChild(noDataMessage);
            }
        });
    } catch (error) {
        console.error('Error fetching or displaying foods:', error);
    }
}
async function deleteDataForSelectedDate() {
    const selectedDate = document.getElementById('calendar-date').value;

    if (selectedDate) {
        try {
            // Use jQuery to send a DELETE request to the server
            $.ajax({
                url: 'http://localhost:3000/students/deleteDataByDate/' + selectedDate,
                type: 'DELETE',
                success: function (data) {
                    // If the server responds with a success status
                    console.log('Data for the selected date deleted successfully');
                    // Optionally, clear the input fields and refresh the displayed data
                    document.getElementById('search-term').value = '';
                    document.getElementById('food-weight').value = '';
                    displayFoodsForSelectedDate(selectedDate);
                },
                error: function (error) {
                    // If the server responds with an error status
                    console.error('Failed to delete data for the selected date', error);
                }
            });
        } catch (error) {
            // Handle fetch error
            console.error('Error sending delete request to server:', error);
        }
    } else {
        console.error('Invalid input data.');
    }
}
