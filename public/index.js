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
            const tablebody = document.getElementById('data-output');
            const result = document.getElementById('search-results');
            const result1 = document.getElementById('food');
            const result2 = document.getElementById('caloie');
            const result3 = document.getElementById('protein');
            const result4 = document.getElementById('carb');
            const result5 = document.getElementById('fat');
            result1.innerHTML = '';
            result2.innerHTML = '';
            result3.innerHTML = '';
            result4.innerHTML = '';
            result5.innerHTML = '';

            if (foodsForSelectedDate.length > 0) {
                let totalCalories = 0;
                let totalProtein = 0;
                let totalCarbs = 0;
                let totalFats = 0;
            
                foodsForSelectedDate.forEach(food => {
                    const foodNameCell = document.createElement('td');
                    foodNameCell.textContent = food.foodname;
                    result1.appendChild(foodNameCell);

                    const calorieCell = document.createElement('td');
                    calorieCell.textContent = `${food.food_calories} Calories`;
                    result2.appendChild(calorieCell);

                    const proteinCell = document.createElement('td');
                    proteinCell.textContent = `${food.food_protein}g`;
                    result3.appendChild(proteinCell);
            
                    const carbCell = document.createElement('td');
                    carbCell.textContent = `${food.food_carbs}g`;
                    result4.appendChild(carbCell);
            
                    const fatCell = document.createElement('td');
                    fatCell.textContent = `${food.food_fats}g`;
                    result5.appendChild(fatCell);

                    result.appendChild(row);
            
                    // Sum up the total values
                    totalCalories += parseFloat(food.food_calories);
                    totalProtein += parseFloat(food.food_protein);
                    totalFats += parseFloat(food.food_fats);
                    totalCarbs += parseFloat(food.food_carbs);
                });

                const total = document.createElement('td');
                total.textContent = "Total";
                result1.appendChild(total);

                const tcalorieCell = document.createElement('td');
                tcalorieCell.textContent = `${totalCalories}Calories`;
                result2.appendChild(tcalorieCell);

                const tproteinCell = document.createElement('td');
                tproteinCell.textContent = `${totalProtein}g`;
                result3.appendChild(tproteinCell);
            
                const tcarbCell = document.createElement('td');
                tcarbCell.textContent = `${totalCarbs}g`;
                result4.appendChild(tcarbCell);
            
                const tfatCell = document.createElement('td');
                tfatCell.textContent = `${totalFats}g`;
                result5.appendChild(tfatCell);

            } else{
                const noDataMessage = document.createElement('div');
                noDataMessage.textContent = 'No foods recorded for the selected date.';
                result.appendChild(noDataMessage);
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
                url: '/students/deleteDataByDate/' + selectedDate,
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