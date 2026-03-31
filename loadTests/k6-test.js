import { sleep, check } from "k6";
import http from "k6/http";

export const options = {
  cloud: {
    distribution: {
      "amazon:us:ashburn": { loadZone: "amazon:us:ashburn", percent: 100 },
    },
    apm: [],
  },
  thresholds: {},
  scenarios: {
    Imported_HAR: {
      executor: "ramping-vus",
      gracefulStop: "30s",
      stages: [
        { target: 5, duration: "30s" },
        { target: 15, duration: "1m" },
        { target: 10, duration: "30s" },
        { target: 0, duration: "30s" },
      ],
      gracefulRampDown: "30s",
      exec: "imported_HAR",
    },
  },
};

export function imported_HAR() {
  let response;

  const vars = {};

  // Home page
  response = http.get("https://pizza.kevin-jwt-pizza.click/", {
    headers: {
      accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      origin: "https://pizza.kevin-jwt-pizza.click",
    },
  });
  sleep(2);

  // Login
  response = http.put(
    "https://pizza-service.kevin-jwt-pizza.click/api/auth",
    '{"email":"d@jwt.com","password":"diner"}',
    {
      headers: {
        accept: "*/*",
        "content-type": "application/json",
        origin: "https://pizza.kevin-jwt-pizza.click",
      },
    },
  );
  check(response, {
    "login status equals 200": (r) => r.status.toString() === "200",
  });

  vars.authToken = response.json().token;

  sleep(2);

  // Get menu
  response = http.get(
    "https://pizza-service.kevin-jwt-pizza.click/api/order/menu",
    {
      headers: {
        accept: "*/*",
        authorization: `Bearer ${vars.authToken}`,
        origin: "https://pizza.kevin-jwt-pizza.click",
      },
    },
  );

  // Get franchises
  response = http.get(
    "https://pizza-service.kevin-jwt-pizza.click/api/franchise?page=0&limit=20&name=*",
    {
      headers: {
        accept: "*/*",
        authorization: `Bearer ${vars.authToken}`,
        origin: "https://pizza.kevin-jwt-pizza.click",
      },
    },
  );
  sleep(4);

  // Get user profile
  response = http.get(
    "https://pizza-service.kevin-jwt-pizza.click/api/user/me",
    {
      headers: {
        accept: "*/*",
        authorization: `Bearer ${vars.authToken}`,
        origin: "https://pizza.kevin-jwt-pizza.click",
      },
    },
  );
  sleep(2);

  // Order pizza
  response = http.post(
    "https://pizza-service.kevin-jwt-pizza.click/api/order",
    '{"items":[{"menuId":31,"description":"Veggie","price":0.0038}],"storeId":"8","franchiseId":8}',
    {
      headers: {
        accept: "*/*",
        authorization: `Bearer ${vars.authToken}`,
        "content-type": "application/json",
        origin: "https://pizza.kevin-jwt-pizza.click",
      },
    },
  );
  check(response, {
    "order status equals 200": (r) => r.status.toString() === "200",
  });

  vars.orderJwt = response.json().jwt;

  sleep(2);

  // Verify pizza
  response = http.post(
    "https://pizza-factory.cs329.click/api/order/verify",
    JSON.stringify({ jwt: vars.orderJwt }),
    {
      headers: {
        accept: "*/*",
        authorization: `Bearer ${vars.authToken}`,
        "content-type": "application/json",
        origin: "https://pizza.kevin-jwt-pizza.click",
      },
    },
  );
  check(response, {
    "verify status equals 200": (r) => r.status.toString() === "200",
  });
}
