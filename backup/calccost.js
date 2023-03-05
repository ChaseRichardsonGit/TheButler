function calculateCost(total_tokens) {
    let cost_per_1000_tokens = 0.02;
    return (total_tokens/1000) * cost_per_1000_tokens;
}
module.exports = { calculateCost }