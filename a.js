const inventory = [
    { name: "apples", quantity: 2 },
    { name: "bananas", quantity: 0 },
    { name: ["cherries a", "a"], quantity: 5 },
    { name: ["cherries"], quantity: 6 }
  ];
  
  function isCherries(fruit) {
    return fruit.name === "cherries";
  }
  
  console.log(inventory.filter(fruit => fruit.name.includes("cherries")));
  // { name: 'cherries', quantity: 5 }
  