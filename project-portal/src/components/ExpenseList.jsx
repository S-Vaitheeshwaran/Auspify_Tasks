import { Eye, Pencil, Trash2 } from "lucide-react";

function ExpenseList({ expenses, loading, onView, onEdit, onDelete }) {
  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>S No.</th>
            <th>Expense Title</th>
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
                Loading expenses...
              </td>
            </tr>
          ) : expenses.length === 0 ? (
            <tr>
              <td colSpan="7" className="empty-table">
                No expenses found.
              </td>
            </tr>
          ) : (
            expenses.map((expense, index) => (
              <tr key={expense.id}>
                <td>{index + 1}</td>

                <td className="expense-name">{expense.title}</td>

                <td>
                  <span className="category-badge">
                    {expense.category || "-"}
                  </span>
                </td>

                <td className="expense-amount">
                  ₹
                  {Number(expense.amount).toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </td>

                <td>{expense.expenseDate || "-"}</td>

                <td>{expense.paymentMethod || "-"}</td>

                <td>
                  <div className="action-buttons">
                    {/* VIEW */}

                    <button
                      className="view-btn"
                      title="View"
                      onClick={() => onView(expense.id)}
                      type="button"
                    >
                      <Eye size={17} />
                    </button>

                    {/* EDIT */}

                    <button
                      className="edit-btn"
                      title="Edit"
                      onClick={() => onEdit(expense)}
                      type="button"
                    >
                      <Pencil size={17} />
                    </button>

                    {/* DELETE */}

                    <button
                      className="delete-btn"
                      title="Delete"
                      onClick={() => onDelete(expense.id)}
                      type="button"
                    >
                      <Trash2 size={17} />
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

export default ExpenseList;
