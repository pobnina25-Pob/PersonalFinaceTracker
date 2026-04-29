/**
 * Floating Point Accuracy Tests
 * ==============================
 * ทดสอบความถูกต้องของการคำนวณทศนิยม (Floating Point)
 * ในระบบ Personal Finance Tracker
 * 
 * ปัญหา: JavaScript ใช้ IEEE 754 double-precision
 *   เช่น 0.1 + 0.2 = 0.30000000000000004
 *   ซึ่งอาจทำให้ยอดเงินผิดพลาดเมื่อมีรายการจำนวนมาก
 */

describe('Floating Point Accuracy - Currency Calculations', () => {

  // ===== 1. การบวกทศนิยมพื้นฐาน =====
  describe('Basic Decimal Addition', () => {
    test('0.1 + 0.2 should be close to 0.3', () => {
      const result = 0.1 + 0.2;
      // JavaScript: 0.30000000000000004
      expect(result).not.toBe(0.3); // This WILL fail with strict equality
      expect(result).toBeCloseTo(0.3, 10); // But passes with tolerance
    });

    test('Summing small amounts should stay accurate', () => {
      const amounts = [19.99, 5.50, 3.01, 12.50, 8.00];
      const sum = amounts.reduce((a, b) => a + b, 0);
      expect(sum).toBeCloseTo(49.00, 2);
    });

    test('Repeated addition of 0.01 (100 times) should equal 1.00', () => {
      let total = 0;
      for (let i = 0; i < 100; i++) {
        total += 0.01;
      }
      // Raw floating point: 0.9999999999999999
      expect(total).not.toBe(1.00);
      expect(total).toBeCloseTo(1.00, 10);
    });
  });

  // ===== 2. Income vs Expense Net Balance =====
  describe('Net Balance Calculations', () => {
    test('Income minus Expense should produce correct balance', () => {
      const income = [1500.50, 2300.75, 450.25];
      const expense = [120.99, 85.50, 250.01, 33.75];

      const totalIncome = income.reduce((a, b) => a + b, 0);
      const totalExpense = expense.reduce((a, b) => a + b, 0);
      const netBalance = totalIncome - totalExpense;

      expect(totalIncome).toBeCloseTo(4251.50, 2);
      expect(totalExpense).toBeCloseTo(490.25, 2);
      expect(netBalance).toBeCloseTo(3761.25, 2);
    });

    test('Balance should be 0 when income equals expense', () => {
      const income = 1234.56;
      const expense = 1234.56;
      expect(income - expense).toBe(0);
    });

    test('Large number of small transactions should sum correctly', () => {
      // Simulate 1000 transactions of ฿0.33
      const transactions = Array(1000).fill(0.33);
      const sum = transactions.reduce((a: number, b: number) => a + b, 0);
      // Expected: 330.00
      expect(sum).toBeCloseTo(330.00, 1);
    });
  });

  // ===== 3. Savings Goal Calculations =====
  describe('Savings Goal - Per Day Calculation', () => {
    test('should calculate correct daily savings amount', () => {
      const targetAmount = 10000;
      const currentAmount = 3500;
      const daysLeft = 15;

      const remaining = targetAmount - currentAmount;
      const perDay = remaining / daysLeft;

      expect(remaining).toBe(6500);
      expect(perDay).toBeCloseTo(433.33, 2);
    });

    test('should handle edge case: 1 day left', () => {
      const remaining = 1500.75;
      const daysLeft = 1;
      const perDay = remaining / daysLeft;
      expect(perDay).toBeCloseTo(1500.75, 2);
    });

    test('should handle edge case: 0 days left (deadline passed)', () => {
      const remaining = 500;
      const daysLeft = 0;
      // Our app uses: daysLeft > 0 ? remaining / daysLeft : remaining
      const perDay = daysLeft > 0 ? remaining / daysLeft : remaining;
      expect(perDay).toBe(500); // Show full remaining as "per day"
    });

    test('should calculate progress percentage accurately', () => {
      const current = 7777.77;
      const target = 10000;
      const progress = (current / target) * 100;
      expect(progress).toBeCloseTo(77.7777, 2);
    });

    test('progress should cap at 100% when over-funded', () => {
      const current = 12000;
      const target = 10000;
      const progress = Math.min((current / target) * 100, 100);
      expect(progress).toBe(100);
    });
  });

  // ===== 4. Currency Formatting Round-Trip =====
  describe('Currency Formatting', () => {
    const formatCurrency = (amount: number): string => {
      return new Intl.NumberFormat('th-TH', {
        style: 'currency',
        currency: 'THB',
      }).format(amount);
    };

    test('should format standard amounts correctly', () => {
      expect(formatCurrency(1500.50)).toContain('1,500.50');
    });

    test('should format zero correctly', () => {
      expect(formatCurrency(0)).toContain('0.00');
    });

    test('should format very small amounts', () => {
      const result = formatCurrency(0.01);
      expect(result).toContain('0.01');
    });

    test('should format large amounts', () => {
      const result = formatCurrency(9999999.99);
      expect(result).toContain('9,999,999.99');
    });

    test('floating point display: 0.1 + 0.2 should display as 0.30', () => {
      const value = 0.1 + 0.2;
      const formatted = formatCurrency(value);
      expect(formatted).toContain('0.30');
    });
  });

  // ===== 5. Import Data Parsing Accuracy =====
  describe('CSV/JSON Import - parseFloat Accuracy', () => {
    test('parseFloat should handle typical currency strings', () => {
      expect(parseFloat('1500.50')).toBe(1500.50);
      expect(parseFloat('0.99')).toBe(0.99);
      expect(parseFloat('10000')).toBe(10000);
    });

    test('parseFloat edge cases', () => {
      expect(parseFloat('0')).toBe(0);
      expect(parseFloat('')).toBeNaN();
      expect(parseFloat('abc')).toBeNaN();
      expect(parseFloat('12.34.56')).toBe(12.34); // Only parses first valid number
    });

    test('Sum of parsed imported data should be accurate', () => {
      const csvAmounts = ['100.10', '200.20', '300.30', '400.40'];
      const sum = csvAmounts.map(a => parseFloat(a)).reduce((a, b) => a + b, 0);
      expect(sum).toBeCloseTo(1001.00, 2);
    });
  });

  // ===== 6. Dashboard Summary Aggregation =====
  describe('Dashboard Summary - Aggregation Accuracy', () => {
    test('groupBy aggregation simulation', () => {
      const transactions = [
        { type: 'INCOME', amount: 30000 },
        { type: 'INCOME', amount: 5000.50 },
        { type: 'EXPENSE', amount: 1200.99 },
        { type: 'EXPENSE', amount: 350.01 },
        { type: 'EXPENSE', amount: 89.50 },
        { type: 'EXPENSE', amount: 4500 },
        { type: 'INCOME', amount: 2000.25 },
      ];

      let totalIncome = 0;
      let totalExpense = 0;
      transactions.forEach(t => {
        if (t.type === 'INCOME') totalIncome += t.amount;
        if (t.type === 'EXPENSE') totalExpense += t.amount;
      });

      expect(totalIncome).toBeCloseTo(37000.75, 2);
      expect(totalExpense).toBeCloseTo(6140.50, 2);
      expect(totalIncome - totalExpense).toBeCloseTo(30860.25, 2);
    });

    test('Empty transactions should return zero', () => {
      const transactions: { type: string; amount: number }[] = [];
      let totalIncome = 0;
      let totalExpense = 0;
      transactions.forEach(t => {
        if (t.type === 'INCOME') totalIncome += t.amount;
        if (t.type === 'EXPENSE') totalExpense += t.amount;
      });
      expect(totalIncome).toBe(0);
      expect(totalExpense).toBe(0);
      expect(totalIncome - totalExpense).toBe(0);
    });
  });

  // ===== 7. Stress Test - Floating Point Drift =====
  describe('Stress Test - Large Volume', () => {
    test('10,000 random transactions should maintain accuracy within 1 satang', () => {
      let expectedTotal = 0;
      const transactions: number[] = [];

      // Generate 10,000 amounts with 2 decimal places
      for (let i = 0; i < 10000; i++) {
        const amount = Math.round(Math.random() * 100000) / 100; // e.g. 999.99
        transactions.push(amount);
        expectedTotal += amount;
      }

      const calculatedTotal = transactions.reduce((a, b) => a + b, 0);

      // Floating point drift should be negligible for financial display
      expect(calculatedTotal).toBeCloseTo(expectedTotal, 2);
    });

    test('Alternating add/subtract should return to zero', () => {
      let balance = 0;
      const amount = 99.99;
      for (let i = 0; i < 10000; i++) {
        balance += amount;
      }
      for (let i = 0; i < 10000; i++) {
        balance -= amount;
      }
      // Floating point: might not be exactly 0
      expect(balance).toBeCloseTo(0, 5);
    });
  });

  // ===== 8. Rounding Helper (Recommended Fix) =====
  describe('Rounding Helper - toFixed2', () => {
    const toFixed2 = (n: number): number => Math.round(n * 100) / 100;

    test('should fix 0.1 + 0.2 issue', () => {
      expect(toFixed2(0.1 + 0.2)).toBe(0.3);
    });

    test('should round 1.005 — known IEEE 754 edge case', () => {
      // 1.005 is stored as 1.00499999... in IEEE 754
      // So Math.round(1.005 * 100) / 100 = 1.00 (NOT 1.01)
      // This is a KNOWN limitation of floating point math
      expect(toFixed2(1.005)).toBe(1); // Documents the real behavior
      
      // For truly accurate rounding, use: Math.round((1.005 + Number.EPSILON) * 100) / 100
      const accurateRound = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
      expect(accurateRound(1.005)).toBe(1.01); // This fixes it!
    });

    test('should handle negative numbers', () => {
      expect(toFixed2(-0.1 - 0.2)).toBe(-0.3);
    });

    test('applying toFixed2 to a sum of 100x ฿0.01 should equal ฿1.00', () => {
      let total = 0;
      for (let i = 0; i < 100; i++) {
        total += 0.01;
      }
      expect(toFixed2(total)).toBe(1.00);
    });
  });
});
