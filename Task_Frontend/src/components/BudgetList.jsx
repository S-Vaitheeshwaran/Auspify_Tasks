import { Pencil, Trash2 } from "lucide-react";

function BudgetList({
  budgetStatus,
  budgets,
  loading,
  formatAmount,
  onEdit,
  onDelete,
}) {
  return (
    <>
      {loading ? (
        <p className="empty-table">Loading budgets...</p>
      ) : budgetStatus.length === 0 ? (
        <p className="empty-table">No budgets created for this month.</p>
      ) : (
        <div className="budget-list">
          {budgetStatus.map((budget, index) => {
            const percentage = Number(budget.percentageUsed || 0);
            const progress = Math.min(percentage, 100);

            return (
              <div
                className="budget-item"
                key={`${budget.category}-${index}`}
              >
                <div className="budget-item-header">
                  <div>
                    <strong>{budget.category}</strong>
                    <span>{budget.alert}</span>
                  </div>
                  <strong>{percentage.toFixed(1)}%</strong>
                </div>

                <div className="budget-progress-track">
                  <div
                    className={`budget-progress-fill ${
                      percentage >= 100
                        ? "budget-danger"
                        : percentage >= 80
                          ? "budget-warning"
                          : ""
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <div className="budget-item-footer">
                  <span>Spent: {formatAmount(budget.spent)}</span>
                  <span>Limit: {formatAmount(budget.monthlyLimit)}</span>
                  <span>Remaining: {formatAmount(budget.remaining)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {budgets.length > 0 && (
        <div className="budget-records">
          <h3>Budget Records</h3>
          {budgets.map((budget) => (
            <div className="budget-record" key={budget.id}>
              <div>
                <strong>{budget.category}</strong>
                <span>{formatAmount(budget.monthlyLimit)}</span>
              </div>

              <div className="action-buttons">
                <button
                  className="edit-btn"
                  onClick={() => onEdit(budget)}
                  title="Edit budget"
                  type="button"
                >
                  <Pencil size={16} />
                </button>
                <button
                  className="delete-btn"
                  onClick={() => onDelete(budget.id)}
                  title="Delete budget"
                  type="button"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

export default BudgetList;