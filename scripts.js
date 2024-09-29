document.addEventListener('DOMContentLoaded', () => {
    const dbName = 'ExamResultsDB';
    const dbVersion = 1; // Database version
    let db;

    // Open or create the database
    let request = indexedDB.open(dbName, dbVersion);

    request.onerror = function(event) {
        console.error('Database error:', event.target.errorCode);
    };

    request.onsuccess = function(event) {
        db = event.target.result;
        console.log('Database opened successfully');
    };

    request.onupgradeneeded = function(event) {
        db = event.target.result;
        let objectStore;

        // Create an object store for students with "id" as the key path
        if (!db.objectStoreNames.contains('students')) {
            objectStore = db.createObjectStore('students', { keyPath: 'id' });
            objectStore.createIndex('name', 'name', { unique: false });
        }

        // Add sample data
        objectStore.transaction.oncomplete = function() {
            let studentObjectStore = db.transaction('students', 'readwrite').objectStore('students');
            studentObjectStore.add({ id: '12345', name: 'John Doe', results: 'Math: A, English: B, Science: A-' });
            studentObjectStore.add({ id: '67890', name: 'Jane Smith', results: 'Math: B, English: A, Science: B+' });
        };
    };

    // Function to fetch results based on student ID and name
    function fetchResults(studentId, studentName) {
        return new Promise((resolve, reject) => {
            let transaction = db.transaction(['students'], 'readonly');
            let objectStore = transaction.objectStore('students');
            let request = objectStore.get(studentId);

            request.onerror = function(event) {
                reject('Unable to retrieve data!');
            };

            request.onsuccess = function(event) {
                if (request.result && request.result.name.toLowerCase() === studentName.toLowerCase()) {
                    resolve(request.result.results);
                } else {
                    reject('No results found for the provided Student ID and Name.');
                }
            };
        });
    }

    // Form submission handler
    const form = document.getElementById('results-form');
    form.addEventListener('submit', function(event) {
        event.preventDefault();

        const studentId = document.getElementById('student-id').value;
        const studentName = document.getElementById('student-name').value;
        const resultOutput = document.getElementById('result-output');

        fetchResults(studentId, studentName)
            .then(results => {
                resultOutput.textContent = `Results: ${results}`;
            })
            .catch(error => {
                resultOutput.textContent = error;
            });
    });
});
