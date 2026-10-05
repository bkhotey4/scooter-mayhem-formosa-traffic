using System;
using UnityEngine;

namespace ScooterMayhem.Cargo
{
    /// <summary>
    /// MultiCargoPhysicsSystem (多元外送貨物物理模擬系統)
    /// Simulates 4 distinct physical cargo types:
    /// 1. BobaTea: Spring-damper liquid oscillation & film burst.
    /// 2. FarmEggs: 10 eggs in carton; impact jolts break shells & splatter yolk on visor.
    /// 3. ShavedIce: Heat & wind thermal melting; severe vibration causes ice avalanche.
    /// 4. FriedChicken: Thermal convective cooling from 100°C; below 70°C crispiness drops exponentially.
    /// </summary>
    public class MultiCargoPhysicsSystem : MonoBehaviour
    {
        public enum CargoType { BobaTea, FarmEggs, ShavedIce, FriedChicken }

        [Header("Current Cargo")]
        [SerializeField] private CargoType currentCargo = CargoType.BobaTea;

        [Header("1. Boba Tea Physics")]
        [SerializeField] private float bobaLiquidVolume = 100f;
        [SerializeField] private float bobaSealHp = 100f;
        [SerializeField] private float springConstant = 22f;
        [SerializeField] private float damping = 4.5f;
        private float liquidAngleRad = 0f;
        private float liquidAngularVelocity = 0f;
        private bool isSealBroken = false;

        [Header("2. Fresh Chicken Eggs")]
        [SerializeField] private int totalEggs = 10;
        [SerializeField] private int crackedEggs = 0;
        [SerializeField] private float eggFractureThreshold = 0.32f;

        [Header("3. Shaved Ice")]
        [SerializeField] private float iceHeightCm = 15f; // Initial 15cm mountain
        [SerializeField] private float iceVolumePct = 100f;
        [SerializeField] private float meltRateBase = 0.35f;

        [Header("4. Fried Chicken Cutlet")]
        [SerializeField] private float chickenTempC = 100f; // Fresh from fryer
        [SerializeField] private float crispinessPct = 100f;

        // Events
        public event Action OnEggCracked;
        public event Action OnBobaSealBurst;
        public event Action OnIceAvalanche;

        public CargoType ActiveCargo => currentCargo;
        public bool IsSealBroken => isSealBroken;

        public void SetCargo(CargoType type)
        {
            currentCargo = type;
            bobaLiquidVolume = 100f;
            bobaSealHp = 100f;
            isSealBroken = false;
            crackedEggs = 0;
            iceHeightCm = 15f;
            iceVolumePct = 100f;
            chickenTempC = 100f;
            crispinessPct = 100f;
        }

        public void UpdateCargoPhysics(float dt, float speedMs, float rollAngleRad, float yawRate, float bumpJolt, bool isStorm)
        {
            switch (currentCargo)
            {
                case CargoType.BobaTea:
                    UpdateBoba(dt, speedMs, rollAngleRad, yawRate, bumpJolt);
                    break;
                case CargoType.FarmEggs:
                    UpdateEggs(dt, bumpJolt);
                    break;
                case CargoType.ShavedIce:
                    UpdateIce(dt, speedMs, bumpJolt, isStorm);
                    break;
                case CargoType.FriedChicken:
                    UpdateChicken(dt, speedMs);
                    break;
            }
        }

        private void UpdateBoba(float dt, float speedMs, float rollAngleRad, float yawRate, float bumpJolt)
        {
            float centrifugalForce = (speedMs / 10f) * yawRate * 1.8f;
            float gravityRollComponent = Mathf.Sin(rollAngleRad) * 9.81f;
            float targetTilt = -(centrifugalForce - gravityRollComponent * 0.35f);

            float accel = -springConstant * (liquidAngleRad - targetTilt) - damping * liquidAngularVelocity;
            liquidAngularVelocity += accel * dt;
            liquidAngleRad += liquidAngularVelocity * dt;
            liquidAngleRad = Mathf.Clamp(liquidAngleRad, -1.2f, 1.2f);

            float totalStress = Mathf.Abs(liquidAngleRad) * 40f + bumpJolt * 150f;
            if (totalStress > 25f)
            {
                bobaSealHp = Mathf.Max(0f, bobaSealHp - (totalStress - 25f) * dt * 1.2f);
                if (bobaSealHp <= 0f && !isSealBroken)
                {
                    isSealBroken = true;
                    OnBobaSealBurst?.Invoke();
                }
            }

            float spillThresh = isSealBroken ? 0.35f : 0.95f;
            if (Mathf.Abs(liquidAngleRad) > spillThresh && bobaLiquidVolume > 0f)
            {
                float rate = (Mathf.Abs(liquidAngleRad) - spillThresh) * (isSealBroken ? 30f : 12f) * dt;
                bobaLiquidVolume = Mathf.Max(0f, bobaLiquidVolume - rate);
            }
        }

        private void UpdateEggs(float dt, float bumpJolt)
        {
            if (bumpJolt > eggFractureThreshold && crackedEggs < totalEggs)
            {
                int newCracks = Mathf.Min(totalEggs - crackedEggs, Mathf.FloorToInt(bumpJolt * 2.5f) + 1);
                crackedEggs += newCracks;
                OnEggCracked?.Invoke();
            }
        }

        private void UpdateIce(float dt, float speedMs, float bumpJolt, bool isStorm)
        {
            float meltSpeed = (meltRateBase + (speedMs / 10f) * 0.45f + (isStorm ? 0.8f : 0f)) * dt;
            iceVolumePct = Mathf.Max(0f, iceVolumePct - meltSpeed);
            iceHeightCm = Mathf.Max(0f, iceHeightCm - meltSpeed * 0.15f);

            if (bumpJolt > 0.4f && iceVolumePct > 15f)
            {
                iceVolumePct = Mathf.Max(0f, iceVolumePct - 8f);
                OnIceAvalanche?.Invoke();
            }
        }

        private void UpdateChicken(float dt, float speedMs)
        {
            // Newton cooling law with airspeed convection
            float ambientTemp = 28f; // Taiwanese ambient 28°C
            float convectionRate = 0.08f + (speedMs / 10f) * 0.12f;
            chickenTempC = Mathf.Max(ambientTemp, chickenTempC - convectionRate * (chickenTempC - ambientTemp) * dt);

            // Crispiness decay below 70°C
            if (chickenTempC < 70f)
            {
                float decayRate = (70f - chickenTempC) * 0.18f * dt;
                crispinessPct = Mathf.Max(0f, crispinessPct - decayRate);
            }
        }

        public string GetStat1Label() => currentCargo switch
        {
            CargoType.BobaTea => "茶湯殘量",
            CargoType.FarmEggs => "完整雞蛋",
            CargoType.ShavedIce => "挫冰體積",
            CargoType.FriedChicken => "出爐溫度",
            _ => "狀態"
        };

        public string GetStat2Label() => currentCargo switch
        {
            CargoType.BobaTea => "封膜耐久度",
            CargoType.FarmEggs => "蛋殼完好率",
            CargoType.ShavedIce => "挫冰高度",
            CargoType.FriedChicken => "酥脆程度",
            _ => "品質"
        };
    }
}
