import { Eye, Pencil, Trash2 } from "lucide-react";

function IncomeList({ incomes, loading, formatAmount, onView, onEdit, onDelete }) {
  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>S No.</th>
            <th>Income Title</th>
            <th>Category</th>
            <th>Amount</th>
            <th>Date</th>
            <th>Payment Method</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td colSpan="7" className="empty-table">
                Loading income records...
              </td>
            </tr>
          ) : incomes.length === 0 ? (
            <tr>
              <td colSpan="7" className="empty-table">
                No income records found.
              </td>
            </tr>
          ) : (
            incomes.map((income, index) => (
              <tr key={income.id}>
                <td>{index + 1}</td>
                <td className="expense-name">{income.title}</td>
                <td>
                  <span className="category-badge">
                    {income.category || "-"}
                  </span>
                </td>
                <td className="income-amount">{formatAmount(income.amount)}</td>
                <td>{income.incomeDate || "-"}</td>
                <td>{income.paymentMethod || "-"}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="view-btn"
                      onClick={() => onView(income.id)}
                      title="View"
                      type="button"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      className="edit-btn"
                      onClick={() => onEdit(income)}
                      title="Edit"
                      type="button"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => onDelete(income.id)}
                      title="Delete"
                      type="button"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default IncomeList;