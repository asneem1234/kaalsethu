// Dynamic Year Content Loader for Feed Templates
// This script fetches AI-generated content for specific years and populates the template

(function() {
    'use strict';

    // Get year from URL parameters
    function getYearFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('year');
    }

    // Get decade from URL or filename
    function getDecadeFromPath() {
        const path = window.location.pathname;
        const match = path.match(/\/(\d{4})s\.html/);
        if (match) {
            return parseInt(match[1]);
        }
        return null;
    }

    // Display loading state
    function showLoading() {
        const main = document.querySelector('main') || document.querySelector('.container');
        if (main) {
            const loadingDiv = document.createElement('div');
            loadingDiv.id = 'ai-loading';
            loadingDiv.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.9);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                color: #fff;
                font-family: 'Inter', sans-serif;
            `;
            loadingDiv.innerHTML = `
                <div style="text-align: center;">
                    <div style="font-size: 2rem; margin-bottom: 1rem;">🤖 AI Generating Content</div>
                    <div style="font-size: 1.2rem; margin-bottom: 2rem;">
                        Gathering historical information for <span id="loading-year"></span>...
                    </div>
                    <div style="width: 50px; height: 50px; border: 5px solid #333; border-top: 5px solid #7f5af0; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                </div>
                <style>
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                </style>
            `;
            document.body.appendChild(loadingDiv);
        }
    }

    // Hide loading state
    function hideLoading() {
        const loadingDiv = document.getElementById('ai-loading');
        if (loadingDiv) {
            loadingDiv.remove();
        }
    }

    // Update introduction section
    function updateIntroduction(content) {
        const introSection = document.querySelector('#intro .card p, #intro .content-section p, #intro p');
        if (introSection && content.introduction) {
            introSection.innerHTML = content.introduction;
        }
    }

    // Update music section
    function updateMusic(content) {
        if (!content.music) return;

        // Update music hits
        const musicList = document.querySelector('#music ul');
        if (musicList && content.music.hits) {
            let musicHTML = '';
            content.music.hits.forEach(hit => {
                musicHTML += `<li><strong>"${hit.title}"</strong> - ${hit.description}</li>`;
            });
            
            // Add trends if available
            if (content.music.trends && content.music.trends.length > 0) {
                musicHTML += '<li style="margin-top: 1rem;"><strong>Music Trends:</strong></li>';
                content.music.trends.forEach(trend => {
                    musicHTML += `<li>${trend}</li>`;
                });
            }
            
            musicList.innerHTML = musicHTML;
        }
    }

    // Update major events section
    function updateMajorEvents(content) {
        if (!content.majorEvents) return;

        const eventsSection = document.querySelector('#events ul, #events .timeline');
        if (eventsSection && content.majorEvents.length > 0) {
            let eventsHTML = '';
            
            // Check if it's a timeline or list
            if (eventsSection.classList.contains('timeline')) {
                // Timeline format
                content.majorEvents.forEach(event => {
                    const year = event.date.match(/\d{4}/)?.[0] || '';
                    eventsHTML += `
                        <div class="timeline-item">
                            <div class="timeline-year">${year}</div>
                            <div class="timeline-content">
                                <h3 class="timeline-title">${event.title}</h3>
                                <p>${event.description}</p>
                            </div>
                        </div>
                    `;
                });
            } else {
                // List format
                content.majorEvents.forEach(event => {
                    eventsHTML += `<li><strong>${event.date}:</strong> ${event.title} - ${event.description}</li>`;
                });
            }
            
            eventsSection.innerHTML = eventsHTML;
        }
    }

    // Update fashion section
    function updateFashion(content) {
        if (!content.fashion) return;

        // Find all lists in fashion section
        const fashionLists = document.querySelectorAll('#fashion ul');
        
        // Men's fashion (first list)
        if (fashionLists[0] && content.fashion.mens) {
            fashionLists[0].innerHTML = content.fashion.mens.map(item => `<li>${item}</li>`).join('');
        }

        // Women's fashion (second list)
        if (fashionLists[1] && content.fashion.womens) {
            fashionLists[1].innerHTML = content.fashion.womens.map(item => `<li>${item}</li>`).join('');
        }

        // Accessories (third list if exists)
        if (fashionLists[2] && content.fashion.accessories) {
            fashionLists[2].innerHTML = content.fashion.accessories.map(item => `<li>${item}</li>`).join('');
        }
    }

    // Update ideologies section
    function updateIdeologies(content) {
        if (!content.ideologies) return;

        const ideologiesLists = document.querySelectorAll('#ideologies ul');
        if (ideologiesLists.length > 0) {
            let allIdeologies = [];
            
            if (content.ideologies.political) {
                allIdeologies = allIdeologies.concat(content.ideologies.political.map(i => `<strong>Political:</strong> ${i}`));
            }
            if (content.ideologies.social) {
                allIdeologies = allIdeologies.concat(content.ideologies.social.map(i => `<strong>Social:</strong> ${i}`));
            }
            if (content.ideologies.economic) {
                allIdeologies = allIdeologies.concat(content.ideologies.economic.map(i => `<strong>Economic:</strong> ${i}`));
            }
            
            if (ideologiesLists[0]) {
                ideologiesLists[0].innerHTML = allIdeologies.map(item => `<li>${item}</li>`).join('');
            }
        }
    }

    // Update technology section
    function updateTechnology(content) {
        if (!content.technology) return;

        const techSection = document.querySelector('#technology ul, #tech ul');
        if (techSection && content.technology.innovations) {
            let techHTML = '';
            
            content.technology.innovations.forEach(innovation => {
                techHTML += `<li>${innovation}</li>`;
            });
            
            if (content.technology.dailyLife) {
                techHTML += '<li style="margin-top: 1rem;"><strong>Impact on Daily Life:</strong></li>';
                content.technology.dailyLife.forEach(impact => {
                    techHTML += `<li>${impact}</li>`;
                });
            }
            
            techSection.innerHTML = techHTML;
        }
    }

    // Update daily life section
    function updateDailyLife(content) {
        if (!content.dailyLife) return;

        const dailySection = document.querySelector('#daily .card, #daily .content-section');
        if (dailySection) {
            let dailyHTML = '<h3>A Typical Day</h3>';
            
            if (content.dailyLife.morning) {
                dailyHTML += `<p><strong>Morning:</strong> ${content.dailyLife.morning}</p>`;
            }
            if (content.dailyLife.afternoon) {
                dailyHTML += `<p><strong>Afternoon:</strong> ${content.dailyLife.afternoon}</p>`;
            }
            if (content.dailyLife.evening) {
                dailyHTML += `<p><strong>Evening:</strong> ${content.dailyLife.evening}</p>`;
            }
            
            if (content.dailyLife.lifestyle && content.dailyLife.lifestyle.length > 0) {
                dailyHTML += '<h3 style="margin-top: 2rem;">Lifestyle</h3><ul>';
                content.dailyLife.lifestyle.forEach(item => {
                    dailyHTML += `<li>${item}</li>`;
                });
                dailyHTML += '</ul>';
            }
            
            dailySection.innerHTML = dailyHTML;
        }
    }

    // Update memories section
    function updateMemories(content) {
        if (!content.memories || content.memories.length === 0) return;

        const memoriesContainer = document.querySelector('#memories .card:last-of-type, #memories .content-section:last-of-type');
        if (memoriesContainer) {
            let memoriesHTML = '<h3>Community Memories</h3>';
            
            content.memories.forEach(memory => {
                memoriesHTML += `
                    <div style="background: #f9f9f9; padding: 15px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #2193b0;">
                        <strong>${memory.name} - ${memory.city}</strong>
                        <p>${memory.memory}</p>
                    </div>
                `;
            });
            
            memoriesContainer.innerHTML = memoriesHTML;
        }
    }

    // Main function to fetch and populate content
    async function loadYearContent() {
        const year = getYearFromURL();
        
        if (!year) {
            console.log('No specific year requested, using default template content');
            return;
        }

        const yearNum = parseInt(year);
        if (isNaN(yearNum) || yearNum < 1950 || yearNum > 2025) {
            console.error('Invalid year:', year);
            return;
        }

        console.log('Loading AI-generated content for year:', year);
        showLoading();
        document.getElementById('loading-year').textContent = year;

        try {
            const response = await fetch('/api/generate-year-content', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ year: yearNum })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Received AI-generated content:', data);

            if (data.success && data.content) {
                // Update all sections with AI-generated content
                updateIntroduction(data.content);
                updateMusic(data.content);
                updateMajorEvents(data.content);
                updateFashion(data.content);
                updateIdeologies(data.content);
                updateTechnology(data.content);
                updateDailyLife(data.content);
                updateMemories(data.content);

                // Update page title
                document.title = `${year} Time Capsule`;
                
                // Update any year placeholders in the page
                document.querySelectorAll('h1, h2').forEach(heading => {
                    heading.textContent = heading.textContent.replace(/\d{4}0s/, year);
                });
            }

        } catch (error) {
            console.error('Error loading year content:', error);
            alert(`Failed to load AI-generated content for ${year}. Showing default decade content.`);
        } finally {
            hideLoading();
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadYearContent);
    } else {
        loadYearContent();
    }

})();
