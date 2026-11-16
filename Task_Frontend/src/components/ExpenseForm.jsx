import { X } from "lucide-react";

function ExpenseForm({
  formData,
  editing,
  saving,
  fieldErrors,
  onChange,
  onSubmit,
  onClose,
}) {
  const inputClass = (field) =>
    `form-input${fieldErrors[field] ? " input-error" : ""}`;

  const renderFieldError = (field) =>
    fieldErrors[field] ? (
      <small className="field-error">{fieldErrors[field]}</small>
    ) : null;

  return (
    <div className="modal-overlay">
      <div className="expense-modal">
        {/* MODAL HEADER */}

        <div className="modal-header">
          <div>
            <h2>{editing ? "Update Expense" : "Add New Expense"}</h2>

            <p>Enter your expense information below.</p>
          </div>

          <button className="close-btn" onClick={onClose} type="button">
            <X />
          </button>
        </div>

        {/* EXPENSE FORM */}

        <form onSubmit={onSubmit} noValidate>
          <div className="form-grid">
            {/* TITLE */}

            <div className="form-group">
              <label>Expense Title *</label>

              <input
                className={inputClass("title")}
                type="text"
                name="title"
                value={formData.title}
                onChange={onChange}
                placeholder="Enter expense title"
                maxLength={100}
                aria-invalid={Boolean(fieldErrors.title)}
              />

              {renderFieldError("title")}
            </div>

            {/* AMOUNT */}

            <div className="form-group">
              <label>Amount *</label>

              <input
                className={inputClass("amount")}
                type="number"
                name="amount"
                value={formData.amount}
                onChange={onChange}
                placeholder="Enter amount"
                min="0.01"
                step="0.01"
                aria-invalid={Boolean(fieldErrors.amount)}
              />

              {renderFieldError("amount")}
            </div>

            {/* CATEGORY */}

            <div className="form-group">
              <label>Category *</label>

              <select
                className={inputClass("category")}
                name="category"
                value={formData.category}
                onChange={onChange}
                aria-invalid={Boolean(fieldErrors.category)}
              >
                <option value="">Select Category</option>
                <option value="Food">Food</option>
                <option value="Transport">Transport</option>
                <option value="Shopping">Shopping</option>
                <option value="Bills">Bills</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Education">Education</option>
                <option value="Electronics">Electronics</option>
                <option value="Other">Other</option>
              </select>

              {renderFieldError("category")}
            </div>

            {/* EXPENSE DATE */}

            <div className="form-group">
              <label>Expense Date *</label>

              <input
                className={inputClass("expenseDate")}
                type="date"
                name="expenseDate"
                value={formData.expenseDate}
                max={new Date().toLocaleDateString("en-CA")}
                onChange={onChange}
                aria-invalid={Boolean(fieldErrors.expenseDate)}
              />

              {renderFieldError("expenseDate")}
            </div>

            {/* PAYMENT METHOD */}

            <div className="form-group">
              <label>Payment Method *</label>

              <select
                className={inputClass("paymentMethod")}
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={onChange}
                aria-invalid={Boolean(fieldErrors.paymentMethod)}
              >
                <option value="">Select Payment Method</option>
                <option value="Cash">Cash</option>
                <option value="UPI">UPI</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Debit Card">Debit Card</option>
                <option value="Net Banking">Net Banking</option>
              </select>

              {renderFieldError("paymentMethod")}
            </div>

            {/* DESCRIPTION */}

            <div className="form-group full-width">
              <label>Description</label>

              <textarea
                className={inputClass("description")}
                name="description"
                value={formData.description}
                onChange={onChange}
                placeholder="Enter expense description"
                rows="3"
                maxLength={255}
                aria-invalid={Boolean(fieldErrors.description)}
              />

              {renderFieldError("description")}
            </div>

            {/* NOTES */}

            <div className="form-group full-width">
              <label>Notes</label>

              <textarea
                className={inputClass("notes")}
                name="notes"
                value={formData.notes}
                onChange={onChange}
                placeholder="Additional notes"
                rows="3"
                maxLength={255}
                aria-invalid={Boolean(fieldErrors.notes)}
              />

              {renderFieldError("notes")}
            </div>
          </div>

          {/* MODAL FOOTER */}

          <div className="modal-footer">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>

            <button type="submit" className="primary-btn" disabled={saving}>
              {saving
                ? "Saving..."
                : editing
                  ? "Update Expense"
                  : "Save Expense"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ExpenseForm;
