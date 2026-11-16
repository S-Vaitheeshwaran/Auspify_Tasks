import { X } from "lucide-react";

function BudgetForm({
  formData,
  editing,
  saving,
  fieldErrors,
  months,
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
        <div className="modal-header">
          <div>
            <h2>{editing ? "Update Budget" : "Create Monthly Budget"}</h2>
            <p>Set your spending limit for a category.</p>
          </div>

          <button className="close-btn" onClick={onClose} type="button">
            <X />
          </button>
        </div>

        <form onSubmit={onSubmit} noValidate>
          <div className="form-grid">
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

            <div className="form-group">
              <label>Monthly Limit *</label>
              <input
                className={inputClass("monthlyLimit")}
                type="number"
                name="monthlyLimit"
                value={formData.monthlyLimit}
                onChange={onChange}
                min="0.01"
                step="0.01"
                placeholder="Enter budget limit"
                aria-invalid={Boolean(fieldErrors.monthlyLimit)}
              />
              {renderFieldError("monthlyLimit")}
            </div>

            <div className="form-group">
              <label>Month *</label>
              <select
                className={inputClass("month")}
                name="month"
                value={formData.month}
                onChange={onChange}
                aria-invalid={Boolean(fieldErrors.month)}
              >
                {months.map((month, index) => (
                  <option value={index + 1} key={month}>
                    {month}
                  </option>
                ))}
              </select>
              {renderFieldError("month")}
            </div>

            <div className="form-group">
              <label>Year *</label>
              <input
                className={inputClass("year")}
                type="number"
                name="year"
                value={formData.year}
                onChange={onChange}
                min="2000"
                max="9999"
                aria-invalid={Boolean(fieldErrors.year)}
              />
              {renderFieldError("year")}
            </div>

            <div className="form-group full-width">
              <label>Notes</label>
              <textarea
                className={inputClass("notes")}
                name="notes"
                value={formData.notes}
                onChange={onChange}
                rows="3"
                maxLength={255}
                placeholder="Additional notes"
                aria-invalid={Boolean(fieldErrors.notes)}
              />
              {renderFieldError("notes")}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="primary-btn" disabled={saving}>
              {saving
                ? "Saving..."
                : editing
                  ? "Update Budget"
                  : "Save Budget"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BudgetForm;