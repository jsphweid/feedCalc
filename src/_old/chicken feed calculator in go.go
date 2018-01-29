package main

import (
	"fmt"
	//	"strconv"
)

// "math"

const (
	PERCENT_ITERATOR = 0.03
	// TARGET_PROTEIN_LOW = 0.16
	// TARGET_PROTEIN_HIGH = 0.22
	TARGET_PROTEIN_LOW  = 0.16
	TARGET_PROTEIN_HIGH = 0.23
	STARTING_INDEX      = 1
)

type Dec float64

type Feed struct {
	Percent_protein     Dec
	Dollar_per_pound    Dec
	Max_percent         Dec
	Percent_composition Dec
	Name                string
}

// type Feeds struct {
// 	Ar [2]Feed
// 	Length int
// }

func main() {
	feeds := []Feed{
		//Feed{0.000, 0.80, 0.045, 0.045, "Essentials Grower"},
		Feed{0.000, 0.60, 0.085, 0.085, "Essentials Layers"}, // 5%, 3%, 0.5%
		Feed{0.370, 0.75, 0.100, 0.000, "Flax"},
		Feed{0.090, 0.09, 0.300, 0.0, "Corn"},
		Feed{0.090, 0.15, 0.300, 0.0, "Milo"},
		Feed{0.150, 0.37, 0.300, 0.000, "Sunflower Seeds"},
		Feed{0.220, 0.66, 0.300, 0.0, "Peas"},
		Feed{0.125, 0.236, 0.300, 0.0, "Wheat"},
		Feed{0.140, 0.21, 0.150, 0.0, "Oats"},
		Feed{0.123, 0.42, 0.150, 0.0, "Barley (no more than 15% with oats)"},
		Feed{0.600, .977, 0.050, 0.0, "Fish Meal"},
		//Feed{0.370, 0.21, 0.300, 0.0, "Soybeans"},
		Feed{0.450, 0.419, 0.300, 0.0, "Soybean Meal"},
		// Feed{ 0., 0., 0.0, "" },
	}
	best_feeds := make([]Feed, len(feeds))
	copy(best_feeds, feeds)
	for i := 0; i < len(feeds); i++ {
		best_feeds[i].Percent_composition = 1
	}

	find_lowest_cost(best_feeds, feeds, STARTING_INDEX) // 1 b/c I'm skipping over the Essentials
	// iterate over all the feeds incrementally incrementing them by 0.1 at first
	// have the last feed make up the rest of it
	// only consider if total protein within 1% of 19%
	// save lowest cost
	//printFeedPercentComposition(feeds)
	print(best_feeds)
}

func print(feeds []Feed) {
	fmt.Println("100% Complete\n-----------------")
	printFeedPercentComposition(feeds)
	fmt.Printf("----------------\n%.1f%% protein for $%.2f / 100lbs\n", percent_protein(feeds)*100, cost_for(feeds)*100)
}

func printFeedPercentComposition(feeds []Feed) {
	for i := 0; i < len(feeds); i++ {
		fmt.Printf("%2.1f%% of %s\n", 100*feeds[i].Percent_composition, feeds[i].Name)
	}
}

func percent_protein(feeds []Feed) Dec {
	var percent_protein Dec = 0.0
	for i := 0; i < len(feeds); i += 1 {
		percent_protein += feeds[i].Percent_protein * feeds[i].Percent_composition
	}
	return percent_protein
}

func percent_protein_in_range(feeds []Feed) bool {
	percent_protein := percent_protein(feeds)
	return percent_protein > TARGET_PROTEIN_LOW && percent_protein < TARGET_PROTEIN_HIGH
}

func cost_for(feeds []Feed) Dec {
	feeds_cost := Dec(0)
	for i := 0; i < len(feeds); i += 1 {
		feeds_cost += feeds[i].Dollar_per_pound * feeds[i].Percent_composition
	}
	return feeds_cost
}

func cost_lower_than(best_feeds, feeds []Feed) bool {
	return cost_for(feeds) < cost_for(best_feeds)
}

func remaining_percent(feeds []Feed) Dec {
	percent_so_far := Dec(0)
	for i := 0; i < len(feeds)-1; i++ {
		percent_so_far += feeds[i].Percent_composition
	}
	return Dec(1) - percent_so_far
}

func find_lowest_cost(best_feeds, feeds []Feed, index int) bool {
	if index+1 == len(feeds) {
		feeds[index].Percent_composition = remaining_percent(feeds)
		if feeds[index].Percent_composition+.0000001 < 0 || feeds[index].Percent_composition >= feeds[index].Max_percent+.0000001 {
			return true
		}
		// extra .0000001 for floating point
		if percent_protein_in_range(feeds) && cost_lower_than(best_feeds, feeds) {
			copy(best_feeds, feeds)
		}
	} else {
		for p := Dec(0.0); p <= 1; p += PERCENT_ITERATOR {
			if p > feeds[index].Max_percent+0.00001 {
				return false
			}
			if index == STARTING_INDEX {
				fmt.Printf("%.0f%% Complete\r", p*100/feeds[index].Max_percent)
			}
			feeds[index].Percent_composition = p
			if find_lowest_cost(best_feeds, feeds, index+1) {
				return false
			}
		}
	}
	return false
}
