const percentage = (price) => {
  if (price >= 1000 && price <= 1500) {
    return 0.15
  }

  if (price > 1500) {
    return 0.2
  }

  return 0.1
}

const calculate = (price) => {
  return (price * percentage(price)).toFixed(2)
}

module.exports = {
  calculate,
  percentage
}
