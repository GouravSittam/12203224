/**
 * Test script for URL Shortener Microservice API
 * Run this after starting the server to test all endpoints
 */

const axios = require("axios");

const BASE_URL = "http://localhost:3000";

// Test data
const testUrl =
  "https://very-very-very-long-and-descriptive-subdomain-that-goes-on-and-on.somedomain.com/additional/directory/levels/for/more/length/really-long-sub-domain/a-really-long-page";
const customShortcode = "abcd1";

async function testAPI() {
  console.log("🧪 Testing URL Shortener Microservice API\n");

  try {
    // Test 1: Health Check
    console.log("1. Testing Health Check...");
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log("✅ Health Check:", healthResponse.data);
    console.log();

    // Test 2: Create Short URL with custom shortcode
    console.log("2. Creating Short URL with custom shortcode...");
    const createResponse = await axios.post(`${BASE_URL}/shorturls`, {
      url: testUrl,
      validity: 30,
      shortcode: customShortcode,
    });
    console.log("✅ Short URL Created:", createResponse.data);
    console.log();

    // Test 3: Create Short URL with auto-generated shortcode
    console.log("3. Creating Short URL with auto-generated shortcode...");
    const createAutoResponse = await axios.post(`${BASE_URL}/shorturls`, {
      url: "https://www.google.com",
      validity: 60,
    });
    console.log("✅ Auto-generated Short URL:", createAutoResponse.data);
    console.log();

    // Test 4: Get Statistics (before clicks)
    console.log("4. Getting Statistics (before clicks)...");
    const statsResponse = await axios.get(
      `${BASE_URL}/shorturls/${customShortcode}`
    );
    console.log("✅ Statistics:", JSON.stringify(statsResponse.data, null, 2));
    console.log();

    // Test 5: Test Redirect (this will record a click)
    console.log("5. Testing Redirect (this will record a click)...");
    try {
      const redirectResponse = await axios.get(
        `${BASE_URL}/${customShortcode}`,
        {
          maxRedirects: 0,
          validateStatus: function (status) {
            return status >= 200 && status < 400; // Accept redirects
          },
        }
      );
      console.log("✅ Redirect Response Status:", redirectResponse.status);
      console.log("✅ Redirect Location:", redirectResponse.headers.location);
    } catch (redirectError) {
      if (redirectError.response && redirectError.response.status === 302) {
        console.log(
          "✅ Redirect Response Status:",
          redirectError.response.status
        );
        console.log(
          "✅ Redirect Location:",
          redirectError.response.headers.location
        );
      } else {
        console.log("❌ Redirect Error:", redirectError.message);
      }
    }
    console.log();

    // Test 6: Get Statistics (after clicks)
    console.log("6. Getting Statistics (after clicks)...");
    const statsAfterResponse = await axios.get(
      `${BASE_URL}/shorturls/${customShortcode}`
    );
    console.log(
      "✅ Statistics After Click:",
      JSON.stringify(statsAfterResponse.data, null, 2)
    );
    console.log();

    // Test 7: Test Error Cases
    console.log("7. Testing Error Cases...");

    // Test invalid URL
    try {
      await axios.post(`${BASE_URL}/shorturls`, {
        url: "invalid-url",
        validity: 30,
      });
    } catch (error) {
      console.log("✅ Invalid URL Error:", error.response.data);
    }

    // Test duplicate shortcode
    try {
      await axios.post(`${BASE_URL}/shorturls`, {
        url: "https://www.example.com",
        validity: 30,
        shortcode: customShortcode,
      });
    } catch (error) {
      console.log("✅ Duplicate Shortcode Error:", error.response.data);
    }

    // Test non-existent shortcode
    try {
      await axios.get(`${BASE_URL}/shorturls/nonexistent`);
    } catch (error) {
      console.log("✅ Non-existent Shortcode Error:", error.response.data);
    }

    console.log("\n🎉 All tests completed successfully!");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
    }
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testAPI();
}

module.exports = { testAPI };
