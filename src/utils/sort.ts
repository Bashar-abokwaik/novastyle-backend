export function getSortOption(sort: string): { field: string; order: 1 | -1 } {
  switch (sort) {
    case "price-asc":
      return { field: "finalPrice", order: 1 };

    case "price-desc":
      return { field: "finalPrice", order: -1 };

    case "name-asc":
      return { field: "title", order: 1 };

    case "name-desc":
      return { field: "title", order: -1 };

    default:
      return { field: "createdAt", order: -1 };
  }
}
