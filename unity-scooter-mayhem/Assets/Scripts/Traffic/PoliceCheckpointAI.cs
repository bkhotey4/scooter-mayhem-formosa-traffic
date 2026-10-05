// PoliceCheckpointAI.cs - Unity 6 Police DUI Breathalyzer Checkpoint Event
using UnityEngine;

namespace ScooterMayhem.Traffic
{
    public class PoliceCheckpointAI : MonoBehaviour
    {
        [Header("References")]
        public GameObject redStrobeLight;
        public GameObject blueStrobeLight;
        public Transform trafficBatonArm;

        [Header("Detection Settings")]
        public float detectionRadius = 18f;
        public float stopRadius = 5f;
        public float evasionSpeedThreshold = 38f; // km/h

        [Header("Rewards & Penalties")]
        public int passRewardBonus = 200;
        public int evasionRewardPoints = 1500;
        public int runningRoadblockFine = 500;

        private bool hasChecked = false;
        private bool hasEscaped = false;
        private float strobeTimer = 0f;

        private void Update()
        {
            // 1. Alternate Red & Blue Emergency Lights
            strobeTimer += Time.deltaTime;
            bool isRed = (Mathf.FloorToInt(strobeTimer * 10f) % 2 == 0);
            if (redStrobeLight != null) redStrobeLight.SetActive(isRed);
            if (blueStrobeLight != null) blueStrobeLight.SetActive(!isRed);

            // 2. Wave Traffic Baton
            if (trafficBatonArm != null)
            {
                float angle = Mathf.Sin(Time.time * 6f) * 28f;
                trafficBatonArm.localRotation = Quaternion.Euler(0, 0, angle);
            }

            // 3. Player Proximity Check
            GameObject player = GameObject.FindGameObjectWithTag("Player");
            if (player == null) return;

            float dist = Vector3.Distance(transform.position, player.transform.position);

            if (dist < detectionRadius)
            {
                var vehicle = player.GetComponent<Vehicle.ScooterVehicleController>();
                if (vehicle == null) return;

                float speedKmH = vehicle.CurrentSpeedKmH;

                // Case A: Player pulls over politely (DUI Breathalyzer Test)
                if (dist < stopRadius && speedKmH < 4f && !hasChecked)
                {
                    hasChecked = true;
                    AwardBreathalyzerPass();
                }
                // Case B: Player runs the checkpoint at high speed
                else if (dist < 7f && speedKmH > evasionSpeedThreshold && !hasChecked && !hasEscaped)
                {
                    hasChecked = true;
                    if (vehicle.IsWheelie || Mathf.Abs(vehicle.CurrentLeanAngle) > 18f)
                    {
                        // Evasion with style
                        hasEscaped = true;
                        AwardEvasionCombo();
                    }
                    else
                    {
                        // Fine for running roadblock
                        ApplyRoadblockFine();
                    }
                }
            }
            else if (dist > 35f)
            {
                // Reset for next pass
                hasChecked = false;
                hasEscaped = false;
            }
        }

        private void AwardBreathalyzerPass()
        {
            Debug.Log("<color=green>【酒測零檢出安全過關！】 獲得小費獎勵 $200！</color>");
            // Connect to mission manager or UI toast
        }

        private void AwardEvasionCombo()
        {
            Debug.Log("<color=cyan>【華麗衝破警察臨檢！】 +1500 PTS！</color>");
        }

        private void ApplyRoadblockFine()
        {
            Debug.Log("<color=red>【拒絕臨檢逃逸！】 扣除小費 $500！</color>");
        }

        private void OnDrawGizmosSelected()
        {
            Gizmos.color = Color.yellow;
            Gizmos.DrawWireSphere(transform.position, detectionRadius);
            Gizmos.color = Color.green;
            Gizmos.DrawWireSphere(transform.position, stopRadius);
        }
    }
}
