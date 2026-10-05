using System;
using UnityEngine;
using ScooterMayhem.Vehicle;

namespace ScooterMayhem.Traffic
{
    /// <summary>
    /// Taiwanese Cast-Iron Manhole Cover (道路鑄鐵人孔蓋)
    /// Models ubiquitous Taiwan utility manhole lids (台電、自來水、雨水下水道):
    /// - Dual-wheel metallic clank acoustic trigger ("喀咚！")
    /// - Suspension bump shock impulse transferred to vehicle & cargo
    /// - Wet surface slip & drift combo ("【鐵蓋水上漂】人孔蓋滑移神走位！" +450 PTS)
    /// Dual-track parity with web-prototype/src/traffic/TrafficSystem.js.
    /// </summary>
    public class ManholeCoverAI : MonoBehaviour
    {
        public enum UtilityType
        {
            Taipower, // 台電
            Water,    // 自來水
            Sewer     // 雨水下水道
        }

        [Header("Manhole Attributes")]
        [SerializeField] private UtilityType utility = UtilityType.Taipower;
        [SerializeField] private float radius = 0.65f;
        [SerializeField] private float bumpForce = 0.28f;

        [Header("Audio")]
        [SerializeField] private AudioSource audioSource;
        [SerializeField] private AudioClip manholeClankClip;
        [SerializeField] private AudioClip tireSquealClip;

        // Runtime states
        private bool isOverCover;
        private bool driftBonusAwarded;

        public event Action<string, int> OnManholeDriftSuccess;

        private void OnTriggerEnter(Collider other)
        {
            HandleScooterContact(other.GetComponentInParent<ScooterVehicleController>());
        }

        private void OnTriggerStay(Collider other)
        {
            HandleScooterContact(other.GetComponentInParent<ScooterVehicleController>());
        }

        private void OnTriggerExit(Collider other)
        {
            if (other.GetComponentInParent<ScooterVehicleController>() != null)
            {
                isOverCover = false;
            }
        }

        public void CheckProximity(ScooterVehicleController scooter)
        {
            if (scooter == null) return;

            float dist = Vector3.Distance(transform.position, scooter.transform.position);
            if (dist < radius)
            {
                if (!isOverCover)
                {
                    isOverCover = true;
                    PlayManholeClank();
                    scooter.BumpJolt = Mathf.Max(scooter.BumpJolt, bumpForce);

                    // Check for wet slip or aggressive turn drift
                    bool isAggressiveTurn = Mathf.Abs(scooter.CurrentLeanAngle) > 12f;
                    if (isAggressiveTurn && !driftBonusAwarded)
                    {
                        driftBonusAwarded = true;
                        if (tireSquealClip != null && audioSource != null)
                        {
                            audioSource.PlayOneShot(tireSquealClip);
                        }
                        OnManholeDriftSuccess?.Invoke("【鐵蓋水上漂】人孔蓋滑移神走位！", 450);
                    }
                }
            }
            else
            {
                isOverCover = false;
            }
        }

        private void HandleScooterContact(ScooterVehicleController scooter)
        {
            if (scooter == null) return;
            CheckProximity(scooter);
        }

        private void PlayManholeClank()
        {
            if (audioSource != null && manholeClankClip != null)
            {
                audioSource.PlayOneShot(manholeClankClip);
            }
        }
    }
}
