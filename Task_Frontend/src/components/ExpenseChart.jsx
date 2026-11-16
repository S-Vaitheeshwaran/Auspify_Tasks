function ExpenseChart({
  categorySummary = {},
  title = "Category-wise Expenses",
  description = "Understand where your money is going.",
  emptyMessage = "No category data available.",
}) {
  const categories = Object.entries(categorySummary)
    .map(([category, amount]) => ({
      category,
      amount: Number(amount) || 0,
    }))
    .filter((item) => item.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  const total = categories.reduce((sum, item) => sum + item.amount, 0);

  const formatAmount = (amount) =>
    `₹${amount.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const colors = [
    "#6366f1",
    "#06b6d4",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#ec4899",
    "#64748b",
    "#14b8a6",
  ];

  let currentPercentage = 0;

  const gradient = categories
    .map((item, index) => {
      const percentage = (item.amount / total) * 100;
      const start = currentPercentage;
      const end = start + percentage;

      currentPercentage = end;

      return `${colors[index % colors.length]} ${start}% ${end}%`;
    })
    .join(", ");

  return (
    <div className="expense-chart-card">
      <div className="chart-header">
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
      </div>

      {categories.length === 0 ? (
        <div className="empty-chart">{emptyMessage}</div>
      ) : (
        <div className="pie-chart-layout">
          <div
            className="pie-chart"
            style={{
              background: `conic-gradient(${gradient})`,
            }}
          >
            <div className="pie-chart-center">
              <span>Total</span>
              <strong>{formatAmount(total)}</strong>
            </div>
          </div>

          <div className="pie-chart-legend">
            {categories.map((item, index) => {
              const percentage = (item.amount / total) * 100;

              return (
                <div className="pie-legend-item" key={item.category}>
                  <div className="pie-legend-label">
                    <span
                      className="pie-legend-dot"
                      style={{
                        backgroundColor: colors[index % colors.length],
                      }}
                    />
                    <span>{item.category}</span>
                  </div>

                  <div className="pie-legend-value">
                    <strong>{formatAmount(item.amount)}</strong>
                    <small>{percentage.toFixed(1)}%</small>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default ExpenseChart;
