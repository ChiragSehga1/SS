document.addEventListener('DOMContentLoaded', () => {
    // Ensure Chart.js is loaded
    if (typeof Chart !== 'undefined') {
        // Set the global font family and color for Chart.js
        Chart.defaults.font.family = 'Montserrat';
        Chart.defaults.color = '#ffffff80'; // Set default font color to white
    }
    
document.getElementById("downloadBtn").replaceWith(document.getElementById("downloadBtn").cloneNode(true));

document.getElementById("downloadBtn").addEventListener("click", async (event) => {
    event.preventDefault();

    const button = event.target;
    button.disabled = true; // Disable to prevent double-clicks

    await fetchRecordsForDownload(); // Fetch data first

    if (fetchedRecordsForDownload.length > 0) {
        exportToExcel();
    }

    button.disabled = false; // Re-enable after process completes
});



    const ctx = document.getElementById('chartCanvas').getContext('2d');
    let chart;
    let chartType = 'bar'; // Default chart type

    async function fetchData() {
        const room = document.getElementById('room').value;
        const course = document.getElementById('course').value;
        const batch = document.getElementById('batch').value;
        const lab = document.getElementById('lab').value;
    
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // Set timeout to 10 seconds
    
        document.querySelector('.loading').style.display = 'block'; // Show loading spinner
    
        try {
            const response = await fetch(`/data?room=${room}&course=${course}&batch=${batch}&lab=${lab}`, {
                signal: controller.signal
            });
            const data = await response.json();
            
            await updateChart(data); // Keep your existing functionality
        } catch (error) {
            if (error.name === 'AbortError') {
                console.error('Request timed out');
            } else {
                console.error('Error fetching data:', error);
            }
        } finally {
            clearTimeout(timeoutId); // Clear timeout
            document.querySelector('.loading').style.display = 'none'; // Hide loading spinner
        }
    }
    
    let fetchedRecordsForDownload = []; // Store records for Excel download

    async function fetchRecordsForDownload() {
        console.log("Fetching records...");
    
        const room = document.getElementById('room').value;
        const course = document.getElementById('course').value;
        const batch = document.getElementById('batch').value;
        const lab = document.getElementById('lab').value;
    
        document.querySelector('.loading').style.display = 'block';
    
        try {
            const response = await fetch(`/download-data?room=${room}&course=${course}&batch=${batch}&lab=${lab}`);
            fetchedRecordsForDownload = await response.json();
            console.log("Records fetched:", fetchedRecordsForDownload.length);
        } catch (error) {
            console.error('Error fetching records for download:', error);
        } finally {
            document.querySelector('.loading').style.display = 'none';
        }
    }
    


    function exportToExcel() {
        console.log("Export function triggered");
    
        if (!fetchedRecordsForDownload || fetchedRecordsForDownload.length === 0) {
            alert("No data available to download.");
            return;
        }
    
        // Convert JSON records to worksheet
        const worksheet = XLSX.utils.json_to_sheet(fetchedRecordsForDownload);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Records");
    
        // Generate and save Excel file
        const filename = `SurveySync_Records_${new Date().toISOString().slice(0, 10)}.xlsx`; // Custom filename;
        console.log(`Downloading file: ${filename}`);
        XLSX.writeFile(workbook, filename);
    
        // Notify user
        setTimeout(() => {
            alert(`File "${filename}" has been downloaded. Check your Downloads folder.`);
        }, 500);
    }
    
    
    function createBarChart(data) {
        return new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Positive Responses', 'Negative Responses', 'Resolved Help Calls', 'Unresolved Help Calls'],
                datasets: [{
                    label: 'Counts',
                    data: [data.positiveResponses, data.negativeResponses, data.resolvedHelps, data.unresolvedHelps],
                    backgroundColor: ['#0af02c', '#b3041f', '#facc00', '#007BFF'],
                    borderColor: ['#06a11e', '#5e0412', '#ba8d04', '#0225a6'],
                    borderWidth: 4,
                    borderRadius: 15
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false,
                        position: 'top',
                        labels: {
                            font: {
                                size: 14,
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.dataset.label || '';
                                const value = context.raw;
                                const total = data.positiveResponses + data.negativeResponses + data.resolvedHelps + data.unresolvedHelps;
                                const percentage = ((value / total) * 100).toFixed(2);
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        },
                        bodyFont: {
                            size: 14
                        }
                    },
                    datalabels: {
                        display: true,
                        anchor: 'end',
                        align: 'top',
                        formatter: function(value) {
                            return value;
                        },
                        font: {
                            size: 12,
                        }
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Type of Response',
                            font: {
                                size: 16,
                            }
                        }
                    },
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Frequency',
                            font: {
                                size: 16,
                            }
                        },
                        grid: {
                            display: true,
                            color:'#ffffff50',
                            borderColor: '#ffffff',
                            borderWidth: 2,
                            lineWidth: 0.5
                        }
                    }
                }
            }
        });
    }

    function createPieChart(data) {
        return new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Positive Responses', 'Negative Responses', 'Resolved Help Calls', 'Unresolved Help Calls'],
                datasets: [{
                    data: [data.positiveResponses, data.negativeResponses, data.resolvedHelps, data.unresolvedHelps],
                    backgroundColor: ['#0af02c', '#b3041f', '#facc00', '#007BFF'],
                    borderColor: ['#222222', '#222222', '#222222', '#222222'],
                    borderWidth: 5,
                    borderRadius: 3,
                    hoverOffset: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            font: {
                                size: 16
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw;
                                const total = data.positiveResponses + data.negativeResponses + data.resolvedHelps + data.unresolvedHelps;
                                const percentage = ((value / total) * 100).toFixed(2);
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        },
                        bodyFont: {
                            size: 14
                        },
                        titleFont: {
                            size: 16
                        }
                    },
                    datalabels: {
                        display: true,
                        color: '#fff',
                        anchor: 'end',
                        align: 'top',
                        formatter: function(value) {
                            return value;
                        },
                        font: {
                            size: 14
                        },
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        borderRadius: 4
                    }
                },
                animation: {
                    duration: 1000,
                    easing: 'easeOutQuart'
                }
            }
        });
    }

    function createDonutChart(data) {
        return new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Positive Responses', 'Negative Responses', 'Resolved Help Calls', 'Unresolved Help Calls'],
                datasets: [{
                    data: [data.positiveResponses, data.negativeResponses, data.resolvedHelps, data.unresolvedHelps],
                    backgroundColor: ['#0af02c', '#b3041f', '#facc00', '#007BFF'],
                    borderColor: ['#222222', '#222222', '#222222', '#222222'],
                    borderWidth: 5,
                    borderRadius: 3,
                    hoverOffset: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            font: {
                                size: 16
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw;
                                const total = data.positiveResponses + data.negativeResponses + data.resolvedHelps + data.unresolvedHelps;
                                const percentage = ((value / total) * 100).toFixed(2);
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        },
                        bodyFont: {
                            size: 14
                        },
                        titleFont: {
                            size: 16
                        }
                    },
                    datalabels: {
                        display: true,
                        color: '#fff',
                        anchor: 'end',
                        align: 'top',
                        formatter: function(value) {
                            return value;
                        },
                        font: {
                            size: 14
                        },
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        borderRadius: 4
                    }
                },
                animation: {
                    duration: 1000,
                    easing: 'easeOutQuart'
                }
            }
        });
    }

    async function updateChart(data) {
        if (chart) {
            chart.destroy(); // Destroy previous chart
        }

        if (chartType === 'bar') {
            chart = createBarChart(data);
        } else if (chartType === 'pie') {
            chart = createPieChart(data);
        } else if (chartType === 'doughnut') {
            chart = createDonutChart(data);
        }
    }

    document.querySelectorAll('select').forEach(el => {
        el.addEventListener('change', fetchData);
    });

    document.getElementById('chartType').addEventListener('change', (event) => {
        chartType = event.target.value;
        fetchData(); // Fetch data again when chart type changes
    });

    fetchData(); // Initial data fetch
});
