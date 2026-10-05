using System;
using UnityEngine;

namespace ScooterMayhem.Traffic
{
    /// <summary>
    /// Taiwan Speed Trap Camera Pole (科技執法測速照相機桿):
    /// Detects passing player vehicle speed. If speed exceeds speedLimitKmH,
    /// checks whether player is doing a wheelie (翹孤輪) to obscure their rear license plate!
    /// </summary>
    public class SpeedTrapCamera : MonoBehaviour
    {
        [Header("Speed Trap Specs")]
        [SerializeField] private float speedLimitKmH = 60f;
        [SerializeField] private float triggerDistance = 14f;
        [SerializeField] private int fineAmount = 300;

        [Header("Visual Flash & Audio")]
        [SerializeField] private Light flashLight;
        [SerializeField] private AudioSource shutterAudio;

        private Transform playerTransform;
        private Vehicle.ScooterVehicleController playerController;
        private bool isTriggered = false;

        public event Action<string, int> OnSpeedTicketIssued;
        public event Action<string, int> OnSpeedTrapDodged;

        private void Start()
        {
            var player = GameObject.FindGameObjectWithTag("Player");
            if (player != null)
            {
                playerTransform = player.transform;
                playerController = player.GetComponent<Vehicle.ScooterVehicleController>();
            }
        }

        private void Update()
        {
            if (playerTransform == null || playerController == null) return;

            float dist = Vector3.Distance(transform.position, playerTransform.position);

            if (dist < triggerDistance)
            {
                if (!isTriggered && playerController.CurrentSpeedKmH > speedLimitKmH)
                {
                    isTriggered = true;

                    // Check if rear license plate is hidden by wheelie angle!
                    bool isPlateHidden = playerController.CurrentLeanAngle > 25f || (playerTransform.localEulerAngles.x > 25f && playerTransform.localEulerAngles.x < 70f);

                    if (isPlateHidden)
                    {
                        // Dodged camera with wheelie!
                        OnSpeedTrapDodged?.Invoke("神之翹孤輪遮牌！避開測速照相！", 1200);
                    }
                    else
                    {
                        // Flashed and ticketed!
                        TriggerFlash();
                        OnSpeedTicketIssued?.Invoke("【科技執法】超速拍照罰單", fineAmount);
                    }
                }
            }
            else if (dist > 35f)
            {
                isTriggered = false;
            }
        }

        private void TriggerFlash()
        {
            if (shutterAudio != null) shutterAudio.Play();
            if (flashLight != null)
            {
                flashLight.enabled = true;
                Invoke(nameof(TurnOffFlash), 0.15f);
            }
        }

        private void TurnOffFlash()
        {
            if (flashLight != null) flashLight.enabled = false;
        }
    }
}
