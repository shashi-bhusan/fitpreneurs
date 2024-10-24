const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: true,
    },
    emailId: {
      type: String,
      required: true,
      unique: true,
    },
    mobileNumber: {
      type: String,
      required: true,
      unique: true,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    time: {
      type: String,
    },
    assignedEmployees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
      },
    ],
    plan: {
      type: String,
      required: true, 
    },
    planCost: {
      type: Number,
      required: true,
    },
    sessionType: {
      type: String,
      default: "0 Sessions",
    },
    sessionCost: {
      type: Number,
      default: 0, 
    },
    status: {
      type: String,
      enum: ["active", "freeze", "transferred"],
      default: "active",
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    amountPaid: {
      type: Number,
      default: 0,
    },
    paymentMode: {
      type: String,
      default: "cash",
      enum: ["cash", "online"],
    },
    debt: {
      type: Number,
      default: function () {
        return this.totalAmount - this.amountPaid;
      },
    },
    membershipStartDate: {
      type: Date,
      required: true,
    },
    membershipEndDate: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Customer", customerSchema);
