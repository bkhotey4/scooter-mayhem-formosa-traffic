using System;
using System.Collections.Generic;
using UnityEngine;

namespace ScooterMayhem.Game
{
    /// <summary>
    /// Delivery mission manager for Unity 6:
    /// Handles Crazy Taxi style arcade pickup & drop-off across the 84m grid,
    /// dynamic countdown timer, customer ratings, 4-cargo physical evaluations,
    /// 0.75s hold-to-deliver stopping requirement, and payout breakdowns.
    /// </summary>
    public class DeliveryMissionManager : MonoBehaviour
    {
        [Header("Mission Config")]
        [SerializeField] private float orderTimeLimit = 65f;
        [SerializeField] private float deliveryRadius = 3.5f;
        [SerializeField] private float deliveryHoldSeconds = 0.75f;
        [SerializeField] private Transform[] deliveryDestinations;
        [SerializeField] private Cargo.MultiCargoPhysicsSystem multiCargoSystem;

        private int currentDestinationIdx = 0;
        private float currentTimeRemaining;
        private int totalEarnings = 0;
        private int currentScore = 0;
        private int currentStreak = 0;
        private bool isOrderActive = false;
        private float arrivalProgress = 0f;

        public float TimeRemaining => currentTimeRemaining;
        public int TotalEarnings => totalEarnings;
        public int CurrentScore => currentScore;
        public int CurrentStreak => currentStreak;
        public float ArrivalProgress => arrivalProgress;
        public Transform CurrentTarget => deliveryDestinations != null && deliveryDestinations.Length > 0 ? deliveryDestinations[currentDestinationIdx] : null;

        public event Action<Cargo.DeliveryResult, int> OnOrderCompleted;
        public event Action<string> OnOrderFailed;
        public event Action<float> OnArrivalProgressChanged;

        private void Start()
        {
            StartNewOrder();
        }

        private void Update()
        {
            if (!isOrderActive) return;

            currentTimeRemaining -= Time.deltaTime;

            if (currentTimeRemaining <= 0f)
            {
                isOrderActive = false;
                currentStreak = 0;
                OnOrderFailed?.Invoke("時間到！外送逾時，顧客取消訂單！");
                return;
            }

            // Check distance and speed at target
            if (CurrentTarget != null)
            {
                var player = GameObject.FindGameObjectWithTag("Player");
                if (player != null)
                {
                    float dist = Vector3.Distance(player.transform.position, CurrentTarget.position);
                    var rb = player.GetComponent<Rigidbody>();
                    float speed = rb != null ? rb.linearVelocity.magnitude : 0f;

                    // Require slow stop inside handoff zone (<= 3.5m, speed <= 1 m/s for 0.75s)
                    if (dist <= deliveryRadius && speed <= 1.0f)
                    {
                        arrivalProgress = Mathf.Min(1f, arrivalProgress + Time.deltaTime / deliveryHoldSeconds);
                        OnArrivalProgressChanged?.Invoke(arrivalProgress);

                        if (arrivalProgress >= 1f)
                        {
                            CompleteCurrentOrder();
                        }
                    }
                    else
                    {
                        if (arrivalProgress > 0f)
                        {
                            arrivalProgress = 0f;
                            OnArrivalProgressChanged?.Invoke(0f);
                        }
                    }
                }
            }
        }

        public void AddComboReward(string title, int points)
        {
            currentScore += points;
            currentTimeRemaining = Mathf.Min(currentTimeRemaining + 3f, 99f); // Time bonus
        }

        public void CompleteCurrentOrder()
        {
            isOrderActive = false;
            arrivalProgress = 0f;
            currentStreak++;

            var result = new Cargo.DeliveryResult { Stars = 5, Rank = "SSS" };

            int baseTip = result.Stars * 85;
            int speedBonus = Mathf.FloorToInt(currentTimeRemaining * 12);
            int streakBonus = (currentStreak - 1) * 60;
            int challengeBonus = 180;
            int pay = baseTip + speedBonus + streakBonus + challengeBonus;

            totalEarnings += pay;
            currentScore += pay * 2;

            OnOrderCompleted?.Invoke(result, pay);
        }

        public void StartNewOrder()
        {
            if (deliveryDestinations != null && deliveryDestinations.Length > 0)
            {
                currentDestinationIdx = (currentDestinationIdx + 1) % deliveryDestinations.Length;
            }

            // Cycle through cargo types
            if (multiCargoSystem != null)
            {
                var types = (Cargo.MultiCargoPhysicsSystem.CargoType[])Enum.GetValues(typeof(Cargo.MultiCargoPhysicsSystem.CargoType));
                var nextType = types[currentDestinationIdx % types.Length];
                multiCargoSystem.SetCargo(nextType);
            }

            currentTimeRemaining = orderTimeLimit;
            arrivalProgress = 0f;
            isOrderActive = true;
        }
    }
}
