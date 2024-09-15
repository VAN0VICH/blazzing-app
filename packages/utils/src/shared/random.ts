function generateRandomNumber(n: number) {
	return Math.floor(Math.random() * (n + 1));
}

function generateRandomWithBias(
	start: number,
	end: number,
	biasNumber: number,
	biasMultiplier: number,
): number {
	// Create an array for the numbers in the specified range
	const numbers: number[] = [];

	// Fill the array with each number from start to end
	for (let i = start; i <= end; i++) {
		numbers.push(i);
	}

	// Add additional occurrences of m to increase its probability
	for (let i = 0; i < biasMultiplier; i++) {
		numbers.push(biasNumber);
	}

	// Choose a random index from the numbers array
	const randomIndex = Math.floor(Math.random() * numbers.length);
	return numbers[randomIndex]!;
}

export { generateRandomNumber, generateRandomWithBias };
